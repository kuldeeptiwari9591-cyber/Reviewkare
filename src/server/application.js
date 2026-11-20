"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const { openStorage } = require("./storage");
const S = require("./security");
const V = require("./views");
const { PLANS, money, entitlement } = require("./catalog");
const providers = require("./providers");
const A = require("./ai");
const G = require("./google");
const C = require("./compose");
const seo = require("./seo");

function createApplication(options = {}) {
  const production = process.env.NODE_ENV === "production";
  const origin = new URL(
    process.env.BASE_URL ||
      (production ? "https://reviewkare.in" : "http://localhost:3000"),
  ).origin;
  if (
    production &&
    !origin.startsWith("https:") &&
    options.allowHttpForTests !== true
  )
    throw new Error("Production BASE_URL must use HTTPS.");
  if (production && !process.env.DATA_DIR)
    throw new Error(
      "Set DATA_DIR to a persistent disk before starting production.",
    );
  if (production) {
    const required = {
      BASE_URL: "public base URL",
      DATA_DIR: "persistent data directory",
      OPERATOR_NAME: "operator legal/business name",
      SUPPORT_EMAIL: "support or grievance email",
      HOSTING_REGION: "hosting region",
    };
    const missing = Object.entries(required)
      .filter(([key]) => !String(process.env[key] || "").trim())
      .map(([, label]) => label);
    if (missing.length)
      throw new Error(
        `Production configuration incomplete: ${missing.join(", ")}. Refusing to start.`,
      );
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.SUPPORT_EMAIL))
      throw new Error("SUPPORT_EMAIL must be a valid email address.");
  }
  const storage = openStorage(
    process.env.DATA_DIR || path.join(__dirname, "../../.runtime"),
  );
  const provider = options.providers || providers;
  const { db } = storage,
    rate = S.limiter();
  const billingEnabled = process.env.BILLING_ENABLED === "true";
  const aiConfig = A.readConfig(process.env);
  if (production && aiConfig.enabled && !aiConfig.apiKey)
    throw new Error(
      "AI_DRAFTS_ENABLED is true but OPENROUTER_API_KEY is missing. Refusing to start.",
    );
  if (aiConfig.enabled && aiConfig.unknownModels.length)
    throw new Error(
      `AI_MODELS contains unknown IDs: ${aiConfig.unknownModels.join(", ")}. Edit ai-models.js before enabling.`,
    );
  const ai = A.createAi({
    config: aiConfig,
    transport: options.aiTransport,
  });
  const googleConfig = G.readConfig(process.env);
  if (production && googleConfig.enabled && !googleConfig.configured)
    throw new Error(
      `GOOGLE_BUSINESS_ENABLED is true but these values are missing: ${googleConfig.missing.join(", ")}.`,
    );
  const googleFetch = options.googleFetch || fetch;
  const config = {
    origin,
    billingEnabled,
    operatorName: process.env.OPERATOR_NAME || "",
    supportEmail: process.env.SUPPORT_EMAIL || "",
    hostingRegion: process.env.HOSTING_REGION || "",
    verification: {
      google: String(process.env.GOOGLE_SITE_VERIFICATION || "").trim(),
      bing: String(process.env.BING_SITE_VERIFICATION || "").trim(),
    },
    ai: {
      enabled: aiConfig.enabled,
      redactPii: aiConfig.redactPii,
      models: ai.modelsForDisplay,
    },
    google: {
      enabled: googleConfig.enabled,
      configured: googleConfig.configured,
      missing: googleConfig.missing,
      redirectUri: googleConfig.redirectUri,
    },
  };
  const sessionCookie = production
    ? "__Host-reviewkare_session"
    : "reviewkare_session";
  const csrfCookie = production ? "__Host-reviewkare_csrf" : "reviewkare_csrf";
  let authJobs = 0;
  const aiInFlight = new Set();
  const secure = production ? "; Secure" : "";
  function cookie(name, value, maxAge = 604800) {
    return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
  }
  function capability(
    kind,
    email,
    tenantId = null,
    reviewId = null,
    draftHash = null,
  ) {
    const token = S.random();
    db.prepare(
      "INSERT INTO capabilities(hash,kind,email,tenant_id,review_id,draft_hash,expires) VALUES(?,?,?,?,?,?,?)",
    ).run(
      S.digest(token),
      kind,
      email,
      tenantId,
      reviewId,
      draftHash,
      Date.now() + (kind === "approval" ? 86400000 : 1800000),
    );
    return token;
  }
  function findCapability(token, kind) {
    if (typeof token !== "string" || token.length > 100)
      S.fail(404, "This link is invalid.");
    const result = db
      .prepare("SELECT * FROM capabilities WHERE hash=? AND kind=?")
      .get(S.digest(token), kind);
    if (!result) S.fail(404, "This link is invalid.");
    if (result.used || result.expires < Date.now())
      S.fail(410, "This link has expired or was already used.");
    return result;
  }
  function sessionFor(req) {
    const token = S.cookies(req)[sessionCookie];
    if (!token || token.length > 100) return null;
    return (
      db
        .prepare(
          "SELECT s.hash,s.expires,u.email,u.tenant_id,u.verified FROM sessions s JOIN users u ON u.email=s.email WHERE s.hash=? AND s.expires>?",
        )
        .get(S.digest(token), Date.now()) || null
    );
  }
  function createSession(user) {
    db.prepare("DELETE FROM sessions WHERE email=? AND expires<?").run(
      user.email,
      Date.now(),
    );
    // Bound simultaneous sessions, and keep bearer tokens out of the database.
    const existing = db
      .prepare("SELECT hash FROM sessions WHERE email=? ORDER BY expires DESC")
      .all(user.email);
    for (const row of existing.slice(9))
      db.prepare("DELETE FROM sessions WHERE hash=?").run(row.hash);
    const token = S.random();
    db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
      S.digest(token),
      user.email,
      Date.now() + 604800000,
    );
    return token;
  }
  async function authWork(fn) {
    if (authJobs >= 4) S.fail(503, "Please try signing in again shortly.");
    authJobs++;
    try {
      return await fn();
    } finally {
      authJobs--;
    }
  }
  function requireAccess(store) {
    if (!entitlement(store).active)
      S.fail(
        402,
        "Your access period has ended. Export and account settings remain available.",
      );
  }
  function monthly(store, key, limit) {
    const month = new Date().toISOString().slice(0, 7);
    if (store.usage.month !== month)
      store.usage = { month, replies: 0, drafts: 0 };
    if (store.usage[key] >= limit)
      S.fail(429, "Your monthly draft allowance has been reached.");
    store.usage[key]++;
  }
  function qrStore(code) {
    if (!/^[a-zA-Z0-9_-]{12,80}$/.test(code))
      S.fail(404, "Review QR not found.");
    // qr codes are random identifiers bound to a single tenant, never a default tenant.
    const row = db
      .prepare("SELECT tenant_id AS id FROM qr_codes WHERE code=?")
      .get(code);
    if (!row) S.fail(404, "Review QR not found.");
    const store = storage.publicTenant(row.id);
    if (!store || store.qr.code !== code) S.fail(404, "Review QR not found.");
    return store;
  }
  function reviewDraft(review, business) {
    if (review.rating <= 3)
      return `Thank you for sharing your feedback about ${business}. We have noted your concerns and would welcome the opportunity to discuss your experience directly.`;
    return `Thank you for your feedback about ${business}. We appreciate you taking the time to share your experience.`;
  }
  function validateReply(value) {
    const result = S.text(value, "reply text", 2000, true);
    if (
      /guaranteed (?:cure|result)|we (?:will|promise to) refund|your (?:diagnosis|medical record)/i.test(
        result,
      )
    )
      S.fail(
        400,
        "Please review the draft for unsupported promises or sensitive details.",
      );
    return result;
  }
  function sanitizedReview(review) {
    const result = structuredClone(review);
    delete result.reply.approvalToken;
    delete result.reply.approvalHash;
    return result;
  }
  const TOPICS = [
    [/\b(wait|waited|waiting|slow|queue|delay|late)\b/i, "wait time"],
    [/\b(staff|service|server|rude|friendly|host|reception)\b/i, "service"],
    [/\b(price|prices|expensive|overpriced|value|cost|bill|cheap)\b/i, "price"],
    [/\b(clean|dirty|hygiene|hygienic|smell|sticky|hair)\b/i, "cleanliness"],
    [/\b(food|taste|tasty|stale|cold|fresh|coffee|portion)\b/i, "food"],
    [/\b(book|booking|reserve|reservation|appointment|slot)\b/i, "booking"],
    [/\b(equipment|machine|treadmill|weights|class|trainer)\b/i, "equipment"],
  ];
  const NEGATIVE =
    /\b(rude|dirty|slow|cold|stale|overpriced|expensive|worst|never again|disappoint\w*|unhygienic|noisy|ignored|refund|sick|awful|terrible)\b/i;

  function triage(review) {
    const text = String(review.text || "");
    const topics = TOPICS.filter(([pattern]) => pattern.test(text)).map(
      ([, label]) => label,
    );
    const sentiment =
      review.rating >= 4 ? "positive" : review.rating === 3 ? "mixed" : "critical";
    return {
      sentiment,
      topics: topics.slice(0, 3),
      needsAttention:
        review.rating <= 3 || NEGATIVE.test(text) || !text.trim(),
    };
  }
  function guestConfig(store) {
    const vertical =
      (store.guest && store.guest.vertical) || store.location.vertical || "other";
    const configured =
      store.guest && Array.isArray(store.guest.attributes)
        ? store.guest.attributes
        : [];
    return {
      vertical,
      attributes: configured.length
        ? configured.slice(0, 8)
        : C.presetFor(vertical),
    };
  }
  async function googleAccessToken(connection) {
    if (!connection) S.fail(409, "Connect Google Business Profile first.");
    if (connection.accessToken && connection.accessExpires > Date.now() + 60000)
      return connection.accessToken;
    let refreshToken = "";
    try {
      refreshToken = G.open(connection.refreshToken, googleConfig);
    } catch {
      S.fail(
        409,
        "The stored Google credential cannot be read. Reconnect Google Business Profile.",
      );
    }
    try {
      const token = await G.refreshAccessToken(
        refreshToken,
        googleConfig,
        googleFetch,
      );
      storage.google.update(connection.tenantId, {
        accessToken: token.accessToken,
        accessExpires: Date.now() + token.expiresIn * 1000,
        lastError: "",
      });
      return token.accessToken;
    } catch (error) {
      storage.google.update(connection.tenantId, {
        lastError: String(error && error.message).slice(0, 300),
      });
      S.fail(
        409,
        "Google refused the stored token. Reconnect Google Business Profile.",
      );
    }
  }
  function publicCandidate(candidate) {
    const model = A.findModel(candidate.model);
    return {
      id: candidate.id,
      model: candidate.model,
      label: model ? model.label : candidate.model,
      style: candidate.style,
      draftText: candidate.draftText,
      score: candidate.score,
      latencyMs: candidate.latencyMs,
      selected: Boolean(candidate.selected),
      createdAt: candidate.createdAt,
    };
  }
  const appPages = [
    "/app",
    "/app/reviews",
    "/app/approvals",
    "/app/qr",
    "/app/posters",
    "/app/settings",
    "/app/billing",
    "/app/staff",
    "/app/reports",
    "/app/growth",
    "/app/profile-health",
    "/app/local-pack",
    "/app/integrations/whatsapp",
    "/app/integrations/pos",
    "/app/disputes",
    "/app/organizations",
    "/app/team",
    "/app/sentiment",
    "/app/hardware",
  ];
  const staticFiles = {
    "/static/app.css": ["app.css", "text/css; charset=utf-8"],
    "/static/app.js": ["app.js", "text/javascript; charset=utf-8"],
    "/static/scene.js": ["scene.js", "text/javascript; charset=utf-8"],
    "/static/fonts/space-grotesk-latin.woff2": [
      "fonts/space-grotesk-latin.woff2",
      "font/woff2",
    ],
    "/favicon.svg": ["favicon.svg", "image/svg+xml"],
    "/favicon.ico": ["favicon.svg", "image/svg+xml"],
    "/static/logo.png": ["logo.png", "image/png"],
    "/static/og-banner.png": ["og-banner.png", "image/png"],
  };
  const cleanup = setInterval(() => {
    try {
      storage.cleanup();
    } catch {
      console.error(JSON.stringify({ event: "storage_cleanup_failed" }));
    }
  }, 3600000);
  cleanup.unref();
  async function handler(req, res) {
    const requestId = crypto.randomUUID(),
      started = Date.now();
    let pathname = "/",
      session = null;
    const responseCookies = [];
    res.on("finish", () => {
      // Never log token-bearing URLs, request bodies, email, or review text.
      if (res.statusCode >= 500)
        console.error(
          JSON.stringify({
            event: "request_failed",
            requestId,
            status: res.statusCode,
            durationMs: Date.now() - started,
          }),
        );
    });
    const headers = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy":
        "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://checkout.razorpay.com; script-src-attr 'none'; style-src 'self'; img-src 'self' data: https://*.razorpay.com; font-src 'self'; connect-src 'self' https://*.razorpay.com; frame-src https://*.razorpay.com; upgrade-insecure-requests",
      "Cache-Control": "no-store",
      Vary: "Accept-Encoding",
      "X-Request-Id": requestId,
    };
    if (!production)
      headers["Content-Security-Policy"] = headers[
        "Content-Security-Policy"
      ].replace("; upgrade-insecure-requests", "");
    if (production) headers["Strict-Transport-Security"] = "max-age=31536000";
    function send(
      status,
      content,
      type = "application/json; charset=utf-8",
      extra = {},
    ) {
      if (res.writableEnded) return;
      let body = Buffer.isBuffer(content)
        ? content
        : Buffer.from(
            typeof content === "string" ? content : JSON.stringify(content),
          );
      const responseHeaders = { ...headers, "Content-Type": type, ...extra };
      if (responseCookies.length)
        responseHeaders["Set-Cookie"] = responseCookies;
      if (
        body.length > 1024 &&
        body.length <= 262144 &&
        /^(?:text\/|application\/(?:json|xml)|image\/svg\+xml)/.test(type) &&
        /(?:^|[,\s])gzip(?:[,\s;]|$)/.test(req.headers["accept-encoding"] || "")
      ) {
        body = zlib.gzipSync(body);
        responseHeaders["Content-Encoding"] = "gzip";
      }
      responseHeaders["Content-Length"] = body.length;
      res.writeHead(status, responseHeaders);
      res.end(req.method === "HEAD" ? undefined : body);
    }
    const json = (status, data, extra) => send(status, data, undefined, extra);
    function html(title, body, privatePage = false, status = 200) {
      if (privatePage) headers["X-Robots-Tag"] = "noindex, nofollow";
      send(
        status,
        V.layout({
          title,
          body,
          pathname,
          origin,
          privatePage,
          csrf: S.cookies(req)[csrfCookie] || req.csrfToken || "",
          app: pathname.startsWith("/app"),
          config,
        }),
        "text/html; charset=utf-8",
      );
    }
    try {
      const parsed = new URL(req.url, origin);
      pathname = parsed.pathname;
      const hostHeader = String(req.headers.host || "").toLowerCase();
      const bareHost = origin.replace(/^https?:\/\//, "").toLowerCase();
      if (production && hostHeader === "www." + bareHost)
        return send(301, "", "text/plain", {
          Location: origin + req.url,
          "Cache-Control": "public, max-age=3600",
        });
      if (
        pathname.length > 1 &&
        pathname.endsWith("/") &&
        seo.metaFor(pathname.replace(/\/+$/, ""))
      )
        return send(301, "", "text/plain", {
          Location:
            origin + pathname.replace(/\/+$/, "") + (parsed.search || ""),
          "Cache-Control": "public, max-age=3600",
        });
      // Files that must never be reachable, even if someone drops them into a
      // served directory later. The static allowlist already excludes them.
      if (
        /(^|\/)\.(env|git|runtime)([./]|$)|^\/(docs|data|audit)(\/|$)|\.(sqlite|sqlite-wal|sqlite-shm|md|pem|key|backup|log)$|^\/(package(-lock)?\.json|render\.yaml|jsconfig\.json|tsconfig\.json|server\.js)$/i.test(
          pathname,
        )
      )
        return send(404, "Not found.", "text/plain; charset=utf-8");
      if (req.url.length > 4096) S.fail(414, "Request URL is too long.");
      if (!["GET", "HEAD", "POST", "PATCH", "DELETE"].includes(req.method))
        return json(
          405,
          { success: false, error: "Method not allowed." },
          { Allow: "GET, HEAD, POST, PATCH, DELETE" },
        );
      const forwarded = req.headers["x-forwarded-for"];
      // Forwarded addresses are ignored unless the operator explicitly trusts a sanitizing proxy.
      const ip =
        process.env.TRUST_PROXY === "true" && typeof forwarded === "string"
          ? forwarded.split(",").at(-1).trim()
          : req.socket.remoteAddress || "unknown";
      rate.check("all:" + ip, 300);
      session = sessionFor(req);
      if (
        req.method === "GET" &&
        !S.cookies(req)[csrfCookie] &&
        !pathname.startsWith("/static/") &&
        !pathname.startsWith("/api/") &&
        ![
          "/robots.txt",
          "/sitemap.xml",
          "/llms.txt",
          "/llms-full.txt",
          "/.well-known/ai-catalog.json",
          "/favicon.svg",
          "/favicon.ico",
        ].includes(pathname)
      ) {
        req.csrfToken = S.random();
        responseCookies.push(cookie(csrfCookie, req.csrfToken));
      }
      const publicApis = [
        "/api/health",
        "/api/system/status",
        "/api/auth/login",
        "/api/auth/signup",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/auth/verify-email",
        "/api/ai/qr-draft",
        "/api/qr/drafts",
        "/api/contact",
        "/api/book-demo",
      ];
      const approvalApi = /^\/api\/approvals\/[^/]+$/.test(pathname);
      const unavailableWebhook = pathname.startsWith("/api/webhooks/");
      if (
        pathname.startsWith("/api/") &&
        !publicApis.includes(pathname) &&
        !approvalApi &&
        !unavailableWebhook &&
        !session
      )
        S.fail(401, "Sign in to continue.");
      if (pathname === "/api/billing/config")
        S.fail(
          404,
          "Payment credentials can only be configured through deployment secrets.",
        );
      if (unavailableWebhook)
        S.fail(503, "This integration is unavailable. No event was accepted.");
      const unsafe = ["POST", "PATCH", "DELETE"].includes(req.method);
      if (unsafe) {
        const requestOrigin = req.headers.origin;
        if (requestOrigin && requestOrigin !== origin)
          S.fail(403, "Cross-origin changes are not allowed.");
        const csrf = S.cookies(req)[csrfCookie];
        if (!csrf || csrf.length > 100 || req.headers["x-csrf-token"] !== csrf)
          S.fail(403, "Reload the page before submitting this form.");
        if (
          !/^application\/json(?:;|$)/i.test(req.headers["content-type"] || "")
        )
          S.fail(415, "Send application/json.");
        rate.check("write:" + ip, 80);
        if (session) rate.check("tenant-write:" + session.tenant_id, 100);
      }
      const body = unsafe ? await S.readBody(req) : {};
      if (pathname === "/api/health" || pathname === "/api/system/status") {
        if (req.method !== "GET" && req.method !== "HEAD")
          S.fail(405, "Method not allowed.");
        try {
          storage.ready();
        } catch {
          S.fail(503, "Persistent storage is not ready.");
        }
        return json(200, {
          status: "healthy",
          storage: "sqlite",
          mode: googleConfig.enabled ? "google-business-profile" : "copy-and-paste",
          google: googleConfig.enabled
            ? googleConfig.configured
              ? "configured"
              : "incomplete"
            : "disabled",
          billingEnabled,
        });
      }
      if (pathname === "/api/auth/signup" && req.method === "POST") {
        rate.check("auth:" + ip, 10);
        const email = S.email(body.email),
          password = S.password(body.password);
        const name = S.text(body.clinicName, "business name", 120, true),
          owner = S.text(body.ownerName, "owner name", 100, true);
        if (body.termsAccepted !== true && body.termsAccepted !== "on")
          S.fail(
            400,
            "Accept the terms and read the privacy notice before signing up.",
          );
        if (db.prepare("SELECT 1 FROM users WHERE email=?").get(email))
          S.fail(
            409,
            "This email cannot be registered. Try signing in or resetting your password.",
          );
        const hp = await authWork(() => S.hashPassword(password)),
          id = "t_" + S.random(),
          now = Date.now();
        // No trial period. An account is created unpaid and unlocks when a
        // fixed access period is purchased. Local development without payment
        // credentials gets an explicit operator grant so the flow is testable.
        const operatorGrant = !production && !billingEnabled;
        const store = {
          id,
          location: { id, name, city: "", placeId: "", vertical: "other" },
          user: { name: owner, email, role: "owner" },
          plan: operatorGrant
            ? {
                tier: "basic",
                name: "Operator access",
                status: "granted",
                expiresAt: new Date(now + 30 * 86400000).toISOString(),
              }
            : { tier: "none", name: "No plan", status: "unpaid", expiresAt: null },
          guest: { vertical: "other", attributes: [] },
          qr: { code: S.random(), scans: 0, drafts: 0 },
          staff: [],
          receipts: [],
          aiDrafts: false,
          usage: {
            month: new Date().toISOString().slice(0, 7),
            replies: 0,
            drafts: 0,
          },
          createdAt: new Date().toISOString(),
        };
        storage.transaction(() => {
          db.prepare("INSERT INTO tenants(id,document) VALUES(?,?)").run(
            id,
            JSON.stringify(store),
          );
          db.prepare(
            "INSERT INTO users(email,tenant_id,hash,salt) VALUES(?,?,?,?)",
          ).run(email, id, hp.hash, hp.salt);
          storage.event(id, "account_created");
        });
        responseCookies.push(cookie(sessionCookie, createSession({ email })));
        return json(201, {
          success: true,
          redirect: operatorGrant ? "/app" : "/app/billing",
          message: operatorGrant
            ? "Workspace created with operator access."
            : "Workspace created. Choose a plan to unlock drafting.",
        });
      }
      if (pathname === "/api/auth/login" && req.method === "POST") {
        rate.check("auth:" + ip, 10);
        const email = S.email(body.email);
        rate.check("auth-account:" + S.digest(email), 10, 900000);
        const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
        const valid = await authWork(() =>
          S.verifyPassword(
            body.password,
            user?.hash || "00".repeat(64),
            user?.salt || "00".repeat(16),
          ),
        );
        if (!user || !valid) S.fail(401, "Invalid email or password.");
        if (!storage.tenant(user.tenant_id))
          S.fail(503, "Workspace is unavailable. Contact support.");
        responseCookies.push(cookie(sessionCookie, createSession(user)));
        storage.event(user.tenant_id, "login");
        return json(200, {
          success: true,
          redirect: S.redirect(body.redirect),
          user: { email: user.email, role: "owner" },
        });
      }
      if (pathname === "/api/auth/logout" && req.method === "POST") {
        db.prepare("DELETE FROM sessions WHERE hash=?").run(session.hash);
        responseCookies.push(cookie(sessionCookie, "", 0));
        return json(200, { success: true, redirect: "/login" });
      }
      if (pathname === "/api/auth/forgot-password" && req.method === "POST") {
        rate.check("recovery:" + ip, 5, 900000);
        const email = S.email(body.email);
        rate.check("recovery-account:" + S.digest(email), 3, 900000);
        if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
          S.fail(
            503,
            "Account email delivery is unavailable. Contact support; no reset email was sent.",
          );
        const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
        if (user) {
          const token = capability("reset", email, user.tenant_id);
          try {
            await provider.sendMail(
              email,
              "Reset your ReviewKare password",
              `Use this single-use link within 30 minutes: ${origin}/reset-password?token=${token}\nIf you did not request this, ignore this email.`,
            );
          } catch (error) {
            db.prepare("DELETE FROM capabilities WHERE hash=?").run(
              S.digest(token),
            );
            throw error;
          }
        }
        return json(200, {
          success: true,
          message:
            "If an eligible account exists, a reset email has been accepted for delivery. Check your inbox.",
        });
      }
      if (
        pathname === "/api/auth/resend-verification" &&
        req.method === "POST"
      ) {
        rate.check("verify:" + session.email, 3, 900000);
        const token = capability("verify", session.email, session.tenant_id);
        try {
          await provider.sendMail(
            session.email,
            "Verify your ReviewKare email",
            `Use this single-use link within 30 minutes: ${origin}/verify-email?token=${token}`,
          );
        } catch (error) {
          db.prepare("DELETE FROM capabilities WHERE hash=?").run(
            S.digest(token),
          );
          throw error;
        }
        return json(200, {
          success: true,
          message:
            "Verification email accepted for delivery. Check your inbox.",
        });
      }
      if (pathname === "/api/auth/verify-email" && req.method === "POST") {
        const cap = findCapability(body.token, "verify");
        storage.transaction(() => {
          db.prepare("UPDATE users SET verified=1 WHERE email=?").run(
            cap.email,
          );
          db.prepare("UPDATE capabilities SET used=1 WHERE hash=?").run(
            cap.hash,
          );
        });
        return json(200, {
          success: true,
          message: "Email verified. You can return to your workspace.",
          redirect: "/app/settings",
        });
      }
      if (pathname === "/api/auth/reset-password" && req.method === "POST") {
        rate.check("reset:" + ip, 5, 900000);
        const cap = findCapability(body.token, "reset");
        const hp = await authWork(() =>
          S.hashPassword(S.password(body.password)),
        );
        storage.transaction(() => {
          findCapability(body.token, "reset");
          db.prepare("UPDATE users SET hash=?,salt=? WHERE email=?").run(
            hp.hash,
            hp.salt,
            cap.email,
          );
          db.prepare(
            "UPDATE capabilities SET used=1 WHERE email=? AND kind IN ('reset','verify')",
          ).run(cap.email);
          db.prepare("DELETE FROM sessions WHERE email=?").run(cap.email);
          storage.event(cap.tenant_id, "password_reset");
        });
        responseCookies.push(cookie(sessionCookie, "", 0));
        return json(200, {
          success: true,
          redirect: "/login",
          message: "Password reset. Sign in with your new password.",
        });
      }
      if (
        ["/api/contact", "/api/book-demo"].includes(pathname) &&
        req.method === "POST"
      ) {
        rate.check("contact:" + ip, 5, 3600000);
        const document = {
          name: S.text(body.name, "name", 100, true),
          email: S.email(body.email),
          message: S.text(body.message, "message", 2000, true),
        };
        const id = crypto.randomUUID();
        db.prepare("INSERT INTO requests VALUES(?,?,?,?,?)").run(
          id,
          pathname.endsWith("contact") ? "contact" : "demo",
          null,
          JSON.stringify(document),
          Date.now(),
        );
        return json(201, {
          success: true,
          message: `Request recorded. Reference: ${id}. A meeting or response has not yet been scheduled.`,
        });
      }
      if (pathname === "/api/qr/drafts" && req.method === "POST") {
        rate.check("draft:" + ip, 20);
        const store = qrStore(S.text(body.shortCode, "QR code", 80, true));
        requireAccess(store);
        const rating = Number(body.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5)
          S.fail(400, "Choose a rating from 1 to 5.");
        const guest = guestConfig(store);
        const allowed = new Set(
          guest.attributes.map((label) => label.toLowerCase()),
        );
        const submitted = Array.isArray(body.attributes)
          ? body.attributes
          : String(body.attributes || "").split(",");
        const selected = submitted
          .map((value) => String(value).trim())
          .filter((value) => allowed.has(value.toLowerCase()))
          .slice(0, 5);
        const note = S.text(String(body.note || body.feedback || ""), "note", 600);
        if (!selected.length && !note)
          S.fail(400, "Pick at least one thing that applied, or write a note.");
        const drafts = C.compose({
          businessName: store.location.name,
          vertical: guest.vertical,
          rating,
          attributes: selected,
          note,
        });
        if (!drafts.length) S.fail(400, "No drafts could be prepared.");
        const month = new Date().toISOString().slice(0, 7);
        const updated = db
          .prepare(
            "UPDATE qr_codes SET drafts=drafts+1,monthly_drafts=CASE WHEN usage_month=? THEN monthly_drafts+1 ELSE 1 END,usage_month=? WHERE code=? AND (usage_month<>? OR monthly_drafts<?)",
          )
          .run(month, month, store.qr.code, month, entitlement(store).drafts);
        if (updated.changes !== 1)
          S.fail(
            429,
            "This business has reached its monthly draft allowance. You can still use its direct Google link.",
          );
        return json(200, {
          success: true,
          drafts,
          selectedAttributes: selected,
          noteIncluded: Boolean(note),
          disclaimer:
            "Drafts use only the rating and options you picked. Edit them before posting.",
        });
      }
      if (approvalApi && req.method === "POST") {
        const token = pathname.split("/")[3];
        storage.transaction(() => {
          const cap = findCapability(token, "approval"),
            store = storage.tenant(cap.tenant_id);
          const review = store
            ? storage.reviews.get(store.id, cap.review_id)
            : null;
          if (!review || S.digest(review.reply.draftText) !== cap.draft_hash)
            S.fail(410, "The draft changed. Ask for a new approval link.");
          validateReply(review.reply.draftText);
          review.reply.status = "approved";
          review.reply.finalText = review.reply.draftText;
          storage.reviews.updateReply(store.id, review.id, review.reply);
          db.prepare("UPDATE capabilities SET used=1 WHERE hash=?").run(
            cap.hash,
          );
          storage.event(store.id, "draft_approved_by_link");
        });
        return json(200, {
          success: true,
          message:
            "Draft approved for copying. Nothing has been posted to Google.",
        });
      }
      let store = session ? storage.tenant(session.tenant_id) : null;
      if (session && !store)
        S.fail(503, "Workspace is unavailable. Contact support.");
      if (pathname === "/api/approval-links" && req.method === "POST") {
        requireAccess(store);
        const review = storage.reviews.get(store.id, body.reviewId);
        if (!review) S.fail(404, "Review not found.");
        validateReply(review.reply.draftText);
        db.prepare(
          "DELETE FROM capabilities WHERE kind=? AND tenant_id=? AND review_id=?",
        ).run("approval", store.id, review.id);
        const token = capability(
          "approval",
          session.email,
          store.id,
          review.id,
          S.digest(review.reply.draftText),
        );
        return json(201, {
          success: true,
          message: `Approval link (expires in 24 hours): ${origin}/a/${token}`,
          approvalUrl: origin + "/a/" + token,
        });
      }
      if (pathname === "/api/settings" && req.method === "POST") {
        const allowed = [
          "name",
          "city",
          "placeId",
          "aiDrafts",
          "vertical",
          "guestAttributes",
        ];
        if (Object.keys(body).some((key) => !allowed.includes(key)))
          S.fail(400, "Unsupported settings field.");
        const previousVertical =
          (store.guest && store.guest.vertical) ||
          store.location.vertical ||
          "other";
        if (body.vertical !== undefined) {
          const vertical = String(body.vertical || "").trim();
          if (!C.PRESETS[vertical])
            S.fail(400, "Choose a supported business type.");
          store.guest = store.guest || { attributes: [] };
          store.guest.vertical = vertical;
          store.location.vertical = vertical;
          if (vertical !== previousVertical && body.guestAttributes === undefined)
            store.guest.attributes = C.presetFor(vertical);
        }
        if (body.guestAttributes !== undefined) {
          const seen = new Set(),
            attributes = [];
          for (const item of String(body.guestAttributes).split(/[,\n]/)) {
            const label = item.replace(/\s+/g, " ").trim().slice(0, 40);
            const key = label.toLowerCase();
            if (!label || seen.has(key)) continue;
            seen.add(key);
            attributes.push(label);
            if (attributes.length >= 8) break;
          }
          store.guest = store.guest || {};
          store.guest.attributes = attributes.length
            ? attributes
            : C.presetFor(store.guest.vertical || previousVertical);
        }
        if (body.aiDrafts !== undefined) {
          if (
            ![true, false, "true", "false"].includes(
              /** @type {any} */ (body.aiDrafts),
            )
          )
            S.fail(400, "Choose whether AI drafts are on or off.");
          const nextAiDrafts =
            body.aiDrafts === true || body.aiDrafts === "true";
          if (nextAiDrafts && !aiConfig.enabled)
            S.fail(
              409,
              "AI drafting is not enabled on this deployment. The setting was not changed.",
            );
          store.aiDrafts = nextAiDrafts;
        }
        if (body.name !== undefined)
          store.location.name = S.text(body.name, "business name", 120, true);
        if (body.city !== undefined)
          store.location.city = S.text(body.city, "city", 100);
        if (body.placeId !== undefined) {
          const place = S.text(body.placeId, "Place ID", 200);
          if (place && !/^[A-Za-z0-9_-]+$/.test(place))
            S.fail(400, "Invalid Google Place ID.");
          store.location.placeId = place;
        }
        storage.save(store);
        storage.event(store.id, "settings_updated");
        return json(200, {
          success: true,
          message: "Business settings saved.",
          location: store.location,
        });
      }
      if (pathname === "/api/google/connect" && req.method === "GET") {
        if (!googleConfig.enabled || !googleConfig.configured)
          S.fail(
            409,
            "Google Business Profile connection is not configured on this deployment.",
          );
        requireAccess(store);
        const state = capability("google", session.email, store.id);
        return send(303, "", "text/plain", {
          Location: G.authUrl(state, googleConfig),
        });
      }
      if (pathname === "/api/google/callback" && req.method === "GET") {
        if (!googleConfig.enabled || !googleConfig.configured)
          S.fail(
            409,
            "Google Business Profile connection is not configured on this deployment.",
          );
        const denied = parsed.searchParams.get("error");
        if (denied)
          return send(303, "", "text/plain", {
            Location: "/app/settings?google=denied",
          });
        const cap = findCapability(
          parsed.searchParams.get("state") || "",
          "google",
        );
        if (!store || store.id !== cap.tenant_id)
          S.fail(403, "This Google connection belongs to another workspace.");
        const code = parsed.searchParams.get("code") || "";
        if (!code) S.fail(400, "Google did not return an authorization code.");
        let token;
        try {
          token = await G.exchangeCode(code, googleConfig, googleFetch);
        } catch {
          return send(303, "", "text/plain", {
            Location: "/app/settings?google=exchange_failed",
          });
        }
        if (!token.refreshToken)
          return send(303, "", "text/plain", {
            Location: "/app/settings?google=no_refresh_token",
          });
        let accountName = "",
          locationName = "",
          locationTitle = "";
        try {
          const accounts = await G.listAccounts(
            token.accessToken,
            googleConfig,
            googleFetch,
          );
          for (const account of accounts) {
            const locations = await G.listLocations(
              token.accessToken,
              account.name,
              googleConfig,
              googleFetch,
            );
            if (locations.length) {
              accountName = account.name;
              locationName = locations[0].name;
              locationTitle = locations[0].title;
              break;
            }
          }
        } catch {
          return send(303, "", "text/plain", {
            Location: "/app/settings?google=no_location",
          });
        }
        if (!accountName || !locationName)
          return send(303, "", "text/plain", {
            Location: "/app/settings?google=no_location",
          });
        storage.google.save(store.id, {
          googleEmail: "",
          accountName,
          locationName,
          locationTitle,
          scopes: token.scope,
          refreshToken: G.seal(token.refreshToken, googleConfig),
          accessToken: token.accessToken,
          accessExpires: Date.now() + token.expiresIn * 1000,
        });
        db.prepare("UPDATE capabilities SET used=1 WHERE hash=?").run(cap.hash);
        storage.event(store.id, "google_connected");
        return send(303, "", "text/plain", {
          Location: "/app/settings?google=connected",
        });
      }
      if (pathname === "/api/google/sync" && req.method === "POST") {
        requireAccess(store);
        const connection = storage.google.get(store.id);
        const accessToken = await googleAccessToken(connection);
        let fetched;
        try {
          fetched = await G.listReviews(
            accessToken,
            connection,
            googleConfig,
            googleFetch,
          );
        } catch (error) {
          storage.google.update(store.id, {
            lastError: String(error && error.message).slice(0, 300),
          });
          S.fail(502, "Google did not return reviews. Nothing was changed.");
        }
        let added = 0;
        storage.transaction(() => {
          for (const item of fetched) {
            const existing = db
              .prepare(
                "SELECT 1 FROM reviews WHERE tenant_id=? AND google_review_id=?",
              )
              .get(store.id, item.googleReviewId);
            storage.reviews.upsertGoogle(store.id, {
              ...item,
              locationId: store.location.id,
            });
            if (!existing) added++;
          }
        });
        storage.google.update(store.id, {
          lastSync: new Date().toISOString(),
          lastError: "",
        });
        storage.event(store.id, "google_synced");
        return json(200, {
          success: true,
          added,
          fetched: fetched.length,
          message: `${fetched.length} reviews fetched from Google. ${added} new.`,
        });
      }
      if (pathname === "/api/google/disconnect" && req.method === "POST") {
        requireAccess(store);
        storage.google.remove(store.id);
        storage.event(store.id, "google_disconnected");
        return json(200, {
          success: true,
          message:
            "Google Business Profile disconnected. Existing copies of reviews are kept.",
        });
      }
      const publishRoute = pathname.match(/^\/api\/reviews\/([^/]+)\/publish$/);
      if (publishRoute && req.method === "POST") {
        requireAccess(store);
        const review = storage.reviews.get(
          store.id,
          decodeURIComponent(publishRoute[1]),
        );
        if (!review) S.fail(404, "Review not found.");
        if (!review.googleReviewId)
          S.fail(
            409,
            "This review was entered by hand, so there is no Google review to reply to.",
          );
        const text = validateReply(
          String(body.text || review.reply.finalText || review.reply.draftText || ""),
        );
        const connection = storage.google.get(store.id);
        const accessToken = await googleAccessToken(connection);
        try {
          await G.putReply(
            accessToken,
            connection,
            review.googleReviewId,
            text,
            googleConfig,
            googleFetch,
          );
        } catch {
          storage.reviews.markPublished(store.id, review.id, "failed");
          S.fail(502, "Google rejected this reply. Nothing was published.");
        }
        storage.reviews.updateReply(store.id, review.id, {
          status: "approved",
          draftText: review.reply.draftText || text,
          finalText: text,
          model: review.reply.model,
          validatorPassed: true,
          isAutoPosted: false,
        });
        storage.reviews.markPublished(store.id, review.id, "posted");
        storage.event(store.id, "reply_published");
        return json(200, {
          success: true,
          message: "Reply published to Google.",
        });
      }
      if (pathname === "/api/reviews" && req.method === "GET") {
        const page = Math.max(
          1,
          Number.parseInt(parsed.searchParams.get("page") || "1", 10) || 1,
        );
        const result = storage.reviews.list(store.id, { page, pageSize: 20 });
        return json(200, {
          success: true,
          reviews: result.rows.map(sanitizedReview),
          page: result.page,
          total: result.total,
        });
      }
      if (pathname === "/api/reviews" && req.method === "POST") {
        requireAccess(store);
        if (storage.reviews.count(store.id) >= 1000)
          S.fail(
            409,
            "Workspace review capacity reached. Export and remove older records first.",
          );
        const rating = Number(body.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5)
          S.fail(400, "Choose a rating from 1 to 5.");
        const review = {
          id: crypto.randomUUID(),
          locationId: store.location.id,
          reviewerName: S.text(body.reviewerName, "reviewer name", 100, true),
          rating,
          text: S.text(body.text || "", "review text", 4000),
          source: "manual",
          createdAt: new Date().toISOString(),
        };
        const draft = validateReply(reviewDraft(review, store.location.name));
        review.reply = {
          draftText: draft,
          status: rating <= 3 ? "held" : "draft",
          model: "english-template-v1",
          validatorPassed: true,
          isAutoPosted: false,
        };
        storage.transaction(() => {
          monthly(store, "replies", entitlement(store).reviews);
          storage.reviews.create(store.id, review);
          storage.save(store);
        });
        return json(201, {
          success: true,
          review: sanitizedReview(review),
          message: "Reply draft created. It has not been published.",
          redirect: "/app/reviews",
        });
      }
      const draftsRoute = pathname.match(
        /^\/api\/reviews\/([a-zA-Z0-9-]+)\/drafts$/,
      );
      if (draftsRoute && req.method === "POST") {
        requireAccess(store);
        if (!aiConfig.enabled)
          S.fail(
            503,
            "AI drafting is not enabled on this deployment. Standard templates are still available.",
          );
        if (!ai.allowedTenant(store.id))
          S.fail(
            403,
            "AI drafting is not enabled for this workspace. Standard templates are still available.",
          );
        if (store.aiDrafts !== true)
          S.fail(
            409,
            "Enable AI drafts in Settings first. No review text was sent.",
          );
        if (!aiConfig.apiKey)
          S.fail(
            503,
            "The AI provider is not configured. No request was made; standard templates are still available.",
          );
        const review = storage.reviews.get(store.id, draftsRoute[1]);
        if (!review) S.fail(404, "Review not found.");
        const month = new Date().toISOString().slice(0, 7),
          usage = storage.aiUsage.month(store.id, month),
          globalUsage = storage.aiUsage.total(month);
        if (
          aiConfig.maxGenerationsPerMonth &&
          usage.generations >= aiConfig.maxGenerationsPerMonth
        )
          S.fail(
            429,
            "This workspace reached its monthly AI draft limit. Standard templates are still available.",
          );
        if (
          aiConfig.tenantMonthlyBudgetMicros &&
          usage.costMicros >= aiConfig.tenantMonthlyBudgetMicros
        )
          S.fail(
            429,
            "This workspace reached its AI budget for the month. Standard templates are still available.",
          );
        if (
          aiConfig.globalMonthlyBudgetMicros &&
          globalUsage.costMicros >= aiConfig.globalMonthlyBudgetMicros
        )
          S.fail(
            503,
            "AI drafting is paused by the operator budget guard. Standard templates are still available.",
          );
        const context = ai.buildPrompt({
          store,
          review,
          models: aiConfig.models,
          redact: aiConfig.redactPii,
          promptVersion: aiConfig.promptVersion,
        });
        const cached = storage.candidates.byHash(
          store.id,
          review.id,
          context.inputHash,
          Date.now() - 3600000,
        );
        if (cached.length >= 3) {
          storage.event(store.id, "ai_drafts_cached");
          return json(200, {
            success: true,
            cached: true,
            fallback: false,
            candidates: cached.map(publicCandidate),
            message:
              "Reused drafts from the last hour. No new provider request was made.",
          });
        }
        const lockKey = store.id + ":" + review.id;
        rate.check("ai:" + store.id, 8, 60000);
        if (aiInFlight.has(lockKey))
          S.fail(
            409,
            "A draft generation is already running for this review. Wait for it to finish.",
          );
        aiInFlight.add(lockKey);
        try {
          const result = await ai.generate({ store, review });
          if (result.fatal) {
            storage.aiUsage.add(store.id, month, {
              generations: 1,
              candidates: 0,
              failures: result.failures.length,
              costMicros: 0,
            });
            storage.event(store.id, "ai_drafts_auth_failed");
            S.fail(
              503,
              "The AI provider rejected the server key. No draft was generated. Contact support.",
            );
          }
          const valid = result.candidates;
          const stored = valid.length
            ? storage.candidates.replace(
                store.id,
                review.id,
                result.inputHash,
                valid,
              )
            : [];
          const costMicros = valid.reduce(
            (sum, candidate) => sum + (candidate.costMicros || 0),
            0,
          );
          storage.aiUsage.add(store.id, month, {
            generations: 1,
            candidates: valid.length,
            failures: result.failures.length,
            costMicros,
          });
          if (!valid.length) {
            // A failed batch must not leave candidates from an older input
            // hash on screen. Selected candidates are retained for audit.
            storage.candidates.replace(store.id, review.id, result.inputHash, []);
            const fallback = reviewDraft(review, store.location.name);
            if (!review.reply.draftText) {
              storage.transaction(() => {
                review.reply.draftText = fallback;
                review.reply.status = review.rating <= 3 ? "held" : "draft";
                review.reply.validatorPassed = true;
                review.reply.isAutoPosted = false;
                storage.reviews.updateReply(store.id, review.id, review.reply);
                storage.save(store);
              });
            }
            storage.event(store.id, "ai_drafts_fallback");
            return json(200, {
              success: true,
              cached: false,
              fallback: true,
              candidates: [],
              draftText: fallback,
              failures: result.failures.map((failure) => failure.code),
              message: `No usable draft came back from the ${result.modelsRequested} configured models. The standard English template is shown instead. Nothing was posted.`,
            });
          }
          storage.event(store.id, "ai_drafts_generated");
          return json(200, {
            success: true,
            cached: false,
            fallback: false,
            candidates: stored.map(publicCandidate),
            generated: valid.length,
            requested: result.modelsRequested,
            redacted: result.redacted,
            failures: result.failures.map((failure) => failure.code),
            message: `${valid.length} of ${result.modelsRequested} models returned a usable draft. Compare them, select one, then edit and approve it. Nothing posts automatically.`,
          });
        } finally {
          aiInFlight.delete(lockKey);
        }
      }
      const selectRoute = pathname.match(
        /^\/api\/reviews\/([a-zA-Z0-9-]+)\/drafts\/([a-zA-Z0-9-]+)\/select$/,
      );
      if (selectRoute && req.method === "POST") {
        requireAccess(store);
        if (!aiConfig.enabled)
          S.fail(503, "AI drafting is not enabled on this deployment.");
        if (store.aiDrafts !== true)
          S.fail(409, "Enable AI drafts in Settings first.");
        const review = storage.reviews.get(store.id, selectRoute[1]);
        if (!review) S.fail(404, "Review not found.");
        const candidate = storage.candidates.select(
          store.id,
          review.id,
          selectRoute[2],
        );
        if (!candidate) S.fail(404, "Draft not found.");
        storage.transaction(() => {
          review.reply.draftText = candidate.draftText;
          review.reply.finalText = null;
          review.reply.status = review.rating <= 3 ? "held" : "draft";
          review.reply.model = candidate.model;
          review.reply.validatorPassed = true;
          review.reply.isAutoPosted = false;
          storage.reviews.updateReply(store.id, review.id, review.reply);
          storage.save(store);
        });
        storage.event(store.id, "ai_draft_selected");
        return json(200, {
          success: true,
          review: sanitizedReview(review),
          message:
            "Draft selected. Edit it if needed, then approve it. Nothing was posted to Google.",
        });
      }
      const reviewRoute = pathname.match(
        /^\/api\/reviews\/([a-zA-Z0-9-]+)(\/reply)?$/,
      );
      if (reviewRoute) {
        const review = storage.reviews.get(store.id, reviewRoute[1]);
        if (!review) S.fail(404, "Review not found.");
        if (req.method === "DELETE" && !reviewRoute[2]) {
          storage.transaction(() => {
            storage.reviews.remove(store.id, review.id);
            db.prepare(
              "DELETE FROM capabilities WHERE tenant_id=? AND review_id=?",
            ).run(store.id, review.id);
          });
          return json(200, { success: true, message: "Review deleted." });
        }
        if (req.method === "PATCH" && reviewRoute[2]) {
          requireAccess(store);
          storage.transaction(() => {
            if (body.action === "approve") {
              review.reply.finalText = validateReply(
                body.text || review.reply.draftText,
              );
              review.reply.draftText = review.reply.finalText;
              review.reply.status = "approved";
            } else if (body.action === "regenerate") {
              monthly(store, "replies", entitlement(store).reviews);
              review.reply.draftText = validateReply(
                reviewDraft(review, store.location.name),
              );
              review.reply.finalText = null;
              review.reply.status = review.rating <= 3 ? "held" : "draft";
            } else S.fail(400, "Choose approve or regenerate.");
            storage.reviews.updateReply(store.id, review.id, review.reply);
            storage.save(store);
          });
          storage.event(store.id, "reply_draft_updated");
          return json(200, {
            success: true,
            review: sanitizedReview(review),
            redirect: "/app/reviews",
            message: "Draft saved. Nothing was posted to Google.",
          });
        }
        S.fail(405, "Method not allowed.");
      }
      if (pathname === "/api/staff" && req.method === "POST") {
        requireAccess(store);
        if (store.staff.length >= 50) S.fail(409, "Staff directory is full.");
        const staff = {
          id: crypto.randomUUID(),
          name: S.text(body.name, "staff name", 100, true),
          role: S.text(body.role, "role", 100, true),
        };
        store.staff.push(staff);
        storage.save(store);
        return json(201, {
          success: true,
          staff,
          message: "Staff member added.",
          redirect: "/app/staff",
        });
      }
      if (pathname === "/api/auth/change-password" && req.method === "POST") {
        rate.check("password:" + session.email, 5, 900000);
        const user = db
          .prepare("SELECT * FROM users WHERE email=?")
          .get(session.email);
        const valid = await authWork(() =>
          S.verifyPassword(body.currentPassword, user.hash, user.salt),
        );
        if (!valid) S.fail(401, "Current password is incorrect.");
        const hp = await authWork(() =>
          S.hashPassword(S.password(body.password)),
        );
        storage.transaction(() => {
          const changed = db
            .prepare("UPDATE users SET hash=?,salt=? WHERE email=? AND hash=?")
            .run(hp.hash, hp.salt, session.email, user.hash);
          if (changed.changes !== 1)
            S.fail(409, "Credentials changed. Sign in again before retrying.");
          db.prepare("DELETE FROM sessions WHERE email=?").run(session.email);
          db.prepare("UPDATE capabilities SET used=1 WHERE email=?").run(
            session.email,
          );
          storage.event(store.id, "password_changed");
        });
        responseCookies.push(cookie(sessionCookie, "", 0));
        return json(200, { success: true, redirect: "/login" });
      }
      if (pathname === "/api/auth/revoke-sessions" && req.method === "POST") {
        db.prepare("DELETE FROM sessions WHERE email=?").run(session.email);
        responseCookies.push(cookie(sessionCookie, "", 0));
        return json(200, { success: true, redirect: "/login" });
      }
      if (pathname === "/api/account/export" && req.method === "GET") {
        rate.check("export:" + session.email, 5, 60000);
        return json(
          200,
          {
            workspace: {
              ...store,
              reviews: storage.reviews.all(store.id),
            },
            requests: db
              .prepare(
                "SELECT kind,document,created FROM requests WHERE tenant_id=?",
              )
              .all(store.id),
          },
          {
            "Content-Disposition":
              'attachment; filename="reviewkare-export.json"',
          },
        );
      }
      if (pathname === "/api/account/delete" && req.method === "POST") {
        rate.check("delete:" + session.email, 3, 900000);
        const user = db
          .prepare("SELECT * FROM users WHERE email=?")
          .get(session.email);
        if (
          body.confirmation !== "DELETE" ||
          !(await authWork(() =>
            S.verifyPassword(body.password, user.hash, user.salt),
          ))
        )
          S.fail(
            400,
            "Confirm your password and type DELETE to remove the workspace.",
          );
        storage.transaction(() => {
          // Retain payment references separately for accounting; remove direct tenant association.
          if (
            db
              .prepare("SELECT hash FROM users WHERE email=?")
              .get(session.email)?.hash !== user.hash
          )
            S.fail(409, "Credentials changed. Sign in again before retrying.");
          db.prepare("UPDATE orders SET tenant_id=? WHERE tenant_id=?").run(
            "deleted_" + S.random(),
            store.id,
          );
          db.prepare("DELETE FROM requests WHERE tenant_id=?").run(store.id);
          db.prepare("DELETE FROM audit WHERE tenant_id=?").run(store.id);
          db.prepare("DELETE FROM tenants WHERE id=?").run(store.id);
        });
        responseCookies.push(cookie(sessionCookie, "", 0));
        return json(200, {
          success: true,
          redirect: "/login",
          message: "Workspace deleted.",
        });
      }
      if (pathname === "/api/billing/create-order" && req.method === "POST") {
        if (!billingEnabled)
          S.fail(503, "Checkout is unavailable. No payment was taken.");
        if (
          !config.operatorName ||
          !config.supportEmail ||
          process.env.TAX_POLICY_CONFIRMED !== "true"
        )
          S.fail(503, "Checkout is awaiting operator and tax configuration.");
        if (!session.verified)
          S.fail(403, "Verify your email in Settings before payment.");
        const plan = Object.hasOwn(PLANS, body.planId)
            ? PLANS[body.planId]
            : null,
          cycle = body.billingCycle;
        if (!plan || !["monthly", "annual"].includes(cycle))
          S.fail(400, "Choose a valid plan and access period.");
        rate.check("order:" + store.id, 5, 3600000);
        const amount = plan[cycle],
          receipt = "rk_" + crypto.randomBytes(12).toString("hex");
        const remote = await provider.razorpay("orders", {
          method: "POST",
          body: {
            amount,
            currency: "INR",
            receipt,
            notes: {
              tenantId: store.id,
              planId: body.planId,
              billingCycle: cycle,
            },
          },
        });
        if (
          typeof remote.id !== "string" ||
          !/^order_[a-zA-Z0-9]+$/.test(remote.id) ||
          remote.amount !== amount ||
          remote.currency !== "INR"
        )
          S.fail(
            502,
            "Provider order details did not match. No plan was activated.",
          );
        db.prepare(
          "INSERT INTO orders(id,tenant_id,plan_id,cycle,amount,currency,expires) VALUES(?,?,?,?,?,?,?)",
        ).run(
          remote.id,
          store.id,
          body.planId,
          cycle,
          amount,
          "INR",
          Date.now() + 3600000,
        );
        return json(200, {
          success: true,
          orderId: remote.id,
          amount,
          amountDisplay: money(amount),
          currency: "INR",
          keyId: process.env.RAZORPAY_KEY_ID,
          planName: plan.name,
          durationDays: cycle === "annual" ? 365 : 30,
        });
      }
      if (pathname === "/api/billing/verify" && req.method === "POST") {
        if (!billingEnabled)
          S.fail(503, "Payment verification is unavailable.");
        const orderId = S.text(body.razorpay_order_id, "order ID", 100, true),
          paymentId = S.text(body.razorpay_payment_id, "payment ID", 100, true);
        if (
          !/^order_[a-zA-Z0-9]+$/.test(orderId) ||
          !/^pay_[a-zA-Z0-9]+$/.test(paymentId)
        )
          S.fail(400, "Invalid payment reference.");
        const order = db
          .prepare("SELECT * FROM orders WHERE id=? AND tenant_id=?")
          .get(orderId, store.id);
        if (!order) S.fail(404, "Order not found.");
        if (order.status !== "created")
          S.fail(409, "Order has already been processed.");
        if (!provider.signature(orderId, paymentId, body.razorpay_signature))
          S.fail(400, "Payment signature verification failed.");
        const payment = await provider.razorpay(
          "payments/" + encodeURIComponent(paymentId),
        );
        if (
          payment.id !== paymentId ||
          payment.order_id !== order.id ||
          payment.amount !== order.amount ||
          payment.currency !== order.currency ||
          payment.status !== "captured" ||
          payment.captured !== true ||
          payment.refunded ||
          payment.amount_refunded > 0
        )
          S.fail(
            409,
            "Payment has not been captured for this order and amount. Access was not changed.",
          );
        storage.transaction(() => {
          const latest = db
            .prepare("SELECT * FROM orders WHERE id=? AND tenant_id=?")
            .get(orderId, session.tenant_id);
          if (latest.status !== "created")
            S.fail(409, "Order has already been processed.");
          const current = storage.tenant(session.tenant_id);
          if (!current)
            S.fail(
              409,
              "Workspace no longer exists. Contact support for payment reconciliation.",
            );
          const now = Date.now(),
            days = order.cycle === "annual" ? 365 : 30;
          const previous =
            current.plan.status === "active"
              ? Date.parse(current.plan.expiresAt)
              : 0;
          current.plan = {
            tier: order.plan_id,
            name: PLANS[order.plan_id].name,
            status: "active",
            billingCycle: order.cycle,
            expiresAt: new Date(
              Math.max(now, previous) + days * 86400000,
            ).toISOString(),
          };
          current.receipts.unshift({
            id: crypto.randomUUID(),
            planName: PLANS[order.plan_id].name,
            amount: order.amount,
            currency: order.currency,
            paidAt: new Date().toISOString(),
            paymentId,
            orderId,
          });
          db.prepare(
            "UPDATE orders SET status='paid',payment_id=? WHERE id=? AND status='created'",
          ).run(paymentId, orderId);
          storage.save(current);
          storage.event(current.id, "payment_verified");
        });
        return json(200, {
          success: true,
          message:
            "Captured payment verified. Fixed-period access activated; no automatic renewal.",
        });
      }
      if (pathname === "/api/billing/refund-request" && req.method === "POST") {
        const paymentId = S.text(
          body.paymentId,
          "payment reference",
          100,
          true,
        );
        const order = db
          .prepare(
            "SELECT * FROM orders WHERE tenant_id=? AND payment_id=? AND status='paid'",
          )
          .get(store.id, paymentId);
        if (!order) S.fail(404, "Paid order not found.");
        if (
          db
            .prepare(
              "SELECT 1 FROM requests WHERE tenant_id=? AND kind='refund' AND json_extract(document,'$.paymentId')=?",
            )
            .get(store.id, paymentId)
        )
          S.fail(409, "A refund request is already recorded for this payment.");
        const id = crypto.randomUUID();
        db.prepare("INSERT INTO requests VALUES(?,?,?,?,?)").run(
          id,
          "refund",
          store.id,
          JSON.stringify({
            paymentId,
            reason: S.text(body.reason, "reason", 1000, true),
          }),
          Date.now(),
        );
        return json(201, {
          success: true,
          message: `Refund request recorded: ${id}. Awaiting manual review; no refund has been processed.`,
        });
      }
      if (pathname === "/api/qr.svg" && req.method === "GET") {
        requireAccess(store);
        if (!store.location.placeId)
          S.fail(409, "Configure your Google Place ID first.");
        const QRCode = require("qrcode");
        const svg = await QRCode.toString(origin + "/q/" + store.qr.code, {
          type: "svg",
          errorCorrectionLevel: "M",
          margin: 4,
          width: 400,
        });
        return send(
          200,
          svg,
          "image/svg+xml",
          parsed.searchParams.has("download")
            ? {
                "Content-Disposition":
                  'attachment; filename="reviewkare-qr.svg"',
              }
            : {},
        );
      }
      if (pathname.startsWith("/api/"))
        S.fail(404, "Endpoint not found or unavailable in this release.");
      if (req.method !== "GET" && req.method !== "HEAD")
        S.fail(405, "Method not allowed.");
      if (staticFiles[pathname]) {
        const [file, type] = staticFiles[pathname];
        return send(
          200,
          fs.readFileSync(path.join(__dirname, "../../public", file)),
          type,
          { "Cache-Control": "public, max-age=86400" },
        );
      }
      if (pathname === "/robots.txt")
        return send(200, seo.robots(origin), "text/plain; charset=utf-8", {
          "Cache-Control": "public, max-age=3600",
        });
      if (pathname === "/sitemap.xml")
        return send(200, seo.sitemap(origin), "application/xml; charset=utf-8", {
          "Cache-Control": "public, max-age=3600",
        });
      if (pathname === "/llms.txt" || pathname === "/llms-full.txt")
        return send(
          200,
          seo.llms(origin, pathname === "/llms-full.txt"),
          "text/plain; charset=utf-8",
          { "Cache-Control": "public, max-age=3600" },
        );
      if (pathname === "/.well-known/ai-catalog.json")
        return json(200, seo.aiCatalog(origin));
      if (
        [
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ].includes(pathname)
      )
        return html(
          pathname.slice(1).replaceAll("-", " "),
          V.auth(
            pathname.slice(1),
            parsed.searchParams.get("token") || "",
            S.redirect(parsed.searchParams.get("redirect")),
          ),
          true,
        );
      if (pathname === "/logout")
        return html(
          "Sign out",
          V.form("/api/auth/logout", "", "Sign out"),
          true,
        );
      if (pathname.startsWith("/app")) {
        if (!session)
          return send(303, "", "text/plain", {
            Location:
              "/login?redirect=" + encodeURIComponent(S.redirect(pathname)),
          });
        const approvalPath = pathname.match(
          /^\/app\/reviews\/([a-zA-Z0-9-]+)\/approval-link$/,
        );
        if (approvalPath) {
          requireAccess(store);
          const review = storage.reviews.get(store.id, approvalPath[1]);
          if (!review) S.fail(404, "Review not found.");
          // This page displays a POST form; loading a GET never issues a capability.
          return html(
            "Create approval link",
            V.form(
              "/api/approval-links",
              V.input("reviewId", "Review", "hidden", review.id),
              "Create a 24-hour approval link",
            ),
            true,
          );
        }
        if (pathname === "/app/qr/print") {
          if (!store.location.placeId)
            S.fail(409, "Configure your Google Place ID first.");
          return html(
            "Print review QR",
            `<h1>${S.escape(store.location.name)}</h1><p>Share your honest experience. All feedback is welcome.</p><div class="qr-preview"><img src="/api/qr.svg" width="400" height="400" alt="Review QR for ${S.escape(store.location.name)}"></div><p class="break">${S.escape(origin + "/q/" + store.qr.code)}</p><button id="print-poster" class="no-print" type="button">Print or save as PDF</button>`,
            true,
          );
        }
        if (!appPages.includes(pathname)) S.fail(404, "Page not found.");
        store.emailVerified = Boolean(session.verified);
        const page = Math.max(
          1,
          Number.parseInt(parsed.searchParams.get("page") || "1", 10) || 1,
        );
        const view = { ...config, page, reviews: [] };
        if (pathname === "/app/reviews" || pathname === "/app/approvals") {
          const result = storage.reviews.list(store.id, {
            page,
            pageSize: 20,
            status: pathname === "/app/approvals" ? "held" : null,
          });
          view.reviews = result.rows;
          view.total = result.total;
          view.pageSize = result.pageSize;
        } else {
          view.total = storage.reviews.count(store.id);
        }
        view.stats = storage.reviews.stats(store.id);
        view.ai = {
          ...config.ai,
          consented: store.aiDrafts === true,
          allowed: ai.allowedTenant(store.id),
        };
        view.guest = guestConfig(store);
        view.google = {
          enabled: config.google.enabled,
          configured: config.google.configured,
          missing: config.google.missing,
          redirectUri: config.google.redirectUri,
          connection: storage.google.get(store.id),
          notice: parsed.searchParams.get("google") || "",
        };
        view.candidatesByReview = {};
        if (
          view.ai.enabled &&
          view.ai.consented &&
          view.ai.allowed &&
          view.reviews.length
        ) {
          for (const item of view.reviews)
            view.candidatesByReview[item.id] = storage.candidates
              .list(store.id, item.id)
              .map(publicCandidate);
        }
        return html(
          pathname === "/app" ? "Your workspace" : pathname.split("/").at(-1),
          V.dashboard(store, pathname, view),
          true,
        );
      }
      const qrPage = pathname.match(/^\/q\/([^/]+)(\/done)?$/);
      if (qrPage) {
        const customerStore = qrStore(qrPage[1]);
        requireAccess(customerStore);
        if (qrPage[2])
          return html(
            "Review handoff",
            "<h1>Your feedback stays in your hands</h1><p>Opening Google does not confirm a review was published. No draft text is stored in this URL.</p>",
            true,
          );
        if (req.method === "GET")
          db.prepare("UPDATE qr_codes SET scans=scans+1 WHERE code=?").run(
            customerStore.qr.code,
          );
        return html("Share your feedback", V.customer(customerStore), true);
      }
      if (pathname.startsWith("/a/")) {
        const token = pathname.slice(3),
          cap = findCapability(token, "approval"),
          approvalStore = storage.tenant(cap.tenant_id);
        const review = approvalStore
          ? storage.reviews.get(approvalStore.id, cap.review_id)
          : null;
        if (!review || S.digest(review.reply.draftText) !== cap.draft_hash)
          S.fail(410, "The draft changed. Ask for a new link.");
        return html(
          "Review this reply",
          `<section class="narrow"><h1>Approve a reply draft</h1><h2>${S.escape(approvalStore.location.name)}</h2><p>${S.escape(review.reviewerName)} · ${review.rating}/5</p><blockquote class="preserve">${S.escape(review.text)}</blockquote><h2>Exact proposed reply</h2><p class="preserve">${S.escape(review.reply.draftText)}</p>${V.form("/api/approvals/" + encodeURIComponent(token), "", "Approve draft for copying")}<p>This approves only this draft. No Google publication is performed.</p></section>`,
          true,
        );
      }
      const meta = seo.metaFor(pathname);
      if (meta) {
        const body = V.publicContent(pathname, config);
        if (body) return html(meta.title, body);
      }
      S.fail(404, "Page not found.");
    } catch (error) {
      const status = Number.isInteger(error.status) ? error.status : 500;
      if (status === 429) headers["Retry-After"] = "60";
      if (status >= 500)
        console.error(
          JSON.stringify({
            event: "handler_error",
            requestId,
            code: error.code || "INTERNAL_ERROR",
          }),
        );
      const message =
        status >= 500 && !error.status
          ? "Service temporarily unavailable. Your action was not confirmed. Please retry or contact support."
          : error.message;
      headers["X-Robots-Tag"] = "noindex, nofollow";
      if (pathname.startsWith("/api/"))
        return json(status, { success: false, error: message, requestId });
      return html(
        status === 404 ? "Page not found" : "Unable to complete request",
        `<h1>${status === 404 ? "Page not found" : "Unable to complete request"}</h1><p>${S.escape(message)}</p>${V.link("/", "Return home")}`,
        true,
        status,
      );
    }
  }
  // Dedicated endpoint placed ahead of the shared handler, still using its full middleware.
  const server = http.createServer((req, res) => {
    handler(req, res).catch(() => {
      if (!res.headersSent)
        res.writeHead(500, {
          "Content-Type": "text/plain",
          "Cache-Control": "no-store",
        });
      res.end("Service unavailable.");
    });
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  function close() {
    clearInterval(cleanup);
    rate.close();
    storage.close();
  }
  return { server, storage, close, config };
}
function start() {
  const app = createApplication();
  app.server.listen(Number(process.env.PORT) || 3000, "0.0.0.0", () =>
    console.log(
      JSON.stringify({
        event: "server_started",
        port: Number(process.env.PORT) || 3000,
        mode: app.config.google.enabled
          ? "google-business-profile"
          : "copy-and-paste",
      }),
    ),
  );
  let closing = false;
  function shutdown() {
    if (closing) return;
    closing = true;
    app.server.close(() => {
      app.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  }
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  return app;
}
module.exports = { createApplication, start };
