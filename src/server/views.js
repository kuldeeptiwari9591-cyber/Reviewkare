"use strict";
const { escape: e } = require("./security");
const { PLANS, money } = require("./catalog");
const legal = require("./legal");
const C = require("./compose");
const seo = require("./seo");
const BLOG = require("./blog");
const input = (name, label, type = "text", value = "", extra = "") =>
  type === "hidden"
    ? `<input name="${e(name)}" type="hidden" value="${e(value)}" ${extra}>`
    : `<label>${e(label)}<input name="${e(name)}" type="${e(type)}" value="${e(value)}" ${extra}></label>`;
const textarea = (name, label, value = "", extra = "") =>
  `<label>${e(label)}<textarea name="${e(name)}" rows="4" ${extra}>${e(value)}</textarea></label>`;
const message = '<p class="status" role="status" aria-live="polite"></p>';
const form = (endpoint, body, button = "Save", extra = "") =>
  `<form method="post" action="${e(endpoint)}" data-api="${e(endpoint)}" ${extra}>${body}${message}<button type="submit">${e(button)}</button></form>`;
const link = (href, label, variant = "secondary") =>
  `<a class="button ${e(variant)}" href="${e(href)}">${e(label)}</a>`;
const wordmark = (href = "/") =>
  `<a class="wordmark" href="${e(href)}"><span class="wordmark-mark" aria-hidden="true"></span>ReviewKare</a>`;
const stars = (rating) => {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return `<span class="stars" aria-hidden="true">${"★".repeat(value)}${"☆".repeat(5 - value)}</span>`;
};
const pageHead = (eyebrow, title, lead = "") =>
  `<header class="section-head"><p class="eyebrow">${e(eyebrow)}</p><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}</header>`;
const eyebrowHead = (eyebrow, html) =>
  html.replace(
    '<article class="prose">',
    `<article class="prose"><p class="eyebrow">${e(eyebrow)}</p>`,
  );
const navLink = (href, label, current = false) =>
  `<a href="${e(href)}"${current ? ' aria-current="page"' : ""}>${e(label)}</a>`;
function draftCard(reviewId, candidate) {
  return `<label class="draft-card"><input type="radio" name="draft-${e(reviewId)}" value="${e(candidate.id)}"${candidate.selected ? " checked" : ""}><span class="draft-body"><strong>${e(candidate.style)}</strong> <small>${e(candidate.label)}</small><span class="preserve">${e(candidate.draftText)}</span><small class="muted">Match score ${Number(candidate.score) || 0}/100 · ${Number(candidate.latencyMs) || 0} ms</small></span></label>`;
}
function aiPanel(review, candidates, ai) {
  if (!ai || !ai.enabled) return "";
  if (!ai.allowed)
    return `<section class="ai-drafts"><h3>AI drafts</h3><p class="muted">AI drafting is not enabled for this workspace on this deployment. Standard templates remain available.</p></section>`;
  if (!ai.consented)
    return `<section class="ai-drafts"><h3>AI drafts</h3><p class="muted">Optional. Enable AI drafts in <a href="/app/settings">Settings</a> to send this review text to OpenRouter and the configured model providers. Standard templates remain available.</p></section>`;
  const id = e(review.id),
    count = (ai.models && ai.models.length) || 5,
    cards = (candidates || []).map((item) => draftCard(review.id, item)).join("");
  return `<section class="ai-drafts" data-ai-review="${id}"><h3>AI drafts</h3><p class="muted">Independent models write one reply each. Compare, select, edit, and approve. Nothing posts automatically.</p><div class="actions"><button type="button" class="secondary" data-generate-drafts="${id}">Generate ${count} AI drafts</button><span class="status" role="status" aria-live="polite"></span></div><div class="draft-list" data-draft-list="${id}" role="radiogroup" aria-label="AI draft options">${cards || '<p class="muted">No AI drafts generated yet.</p>'}</div><div class="actions"><button type="button" data-use-draft="${id}">Use selected draft</button></div></section>`;
}
function aiSettings(store, ai) {
  if (!ai || !ai.enabled)
    return `<section class="settings-block"><h2>AI reply drafts</h2><p class="muted">AI drafting is not enabled on this deployment. Standard English templates are used.</p></section>`;
  const styles = (ai.models || []).map((model) => model.style).join(", ");
  const on = store && store.aiDrafts === true;
  return `<section class="settings-block"><h2>AI reply drafts</h2><p>Optional. When on, the review text you generate drafts for is sent to OpenRouter and its configured model providers to prepare up to ${(ai.models || []).length || 5} candidate replies. Every draft still needs your edit and approval. Nothing is posted automatically.</p><p class="muted">Styles in this deployment: ${e(styles)}. ${ai.redactPii ? "Email addresses, phone numbers, links, and @handles are redacted before sending." : "PII redaction is disabled by the operator."} Do not paste patient-identifying or other sensitive details. Free model endpoints may have different retention and training policies; review the provider terms before enabling.</p>${form(
    "/api/settings",
    `<label>AI drafts<select name="aiDrafts" aria-label="AI drafts"><option value="false"${on ? "" : " selected"}>Off</option><option value="true"${on ? " selected" : ""}>On — I consent to provider processing</option></select></label>`,
    "Save AI setting",
  )}</section>`;
}
const flowSteps = [
  [
    "01",
    "Guest scans the QR",
    "No app, no login. The code opens a page with your business name.",
    "",
    false,
  ],
  [
    "02",
    "Picks a rating and what applied",
    "The things you configured in Settings: food, service, cleanliness, whatever fits.",
    "",
    false,
  ],
  [
    "03",
    "Chooses from 3–5 drafts",
    "Every draft is built only from those selections, so nothing is invented.",
    "No AI needed",
    true,
  ],
  [
    "04",
    "Google review arrives",
    "New reviews are fetched from your Business Profile, with rating and text.",
    "",
    false,
  ],
  [
    "05",
    "AI writes the reply",
    "Sentiment, topics, and a reply you can edit before it goes anywhere.",
    "You approve",
    false,
  ],
  [
    "06",
    "Publish in one click",
    "Send the approved text to Google, or copy it and paste it yourself.",
    "",
    false,
  ],
];
const flow = () =>
  `<ol class="flow" aria-label="How a ReviewKare review moves from QR scan to published reply">${flowSteps
    .map(
      ([step, title, copy, badge, highlight]) =>
        `<li class="flow-node${highlight ? " is-highlight" : ""}"><span class="flow-step">${step}</span><h3>${e(title)}</h3><p>${e(copy)}</p>${badge ? `<span class="node-badge">${e(badge)}</span>` : ""}</li>`,
    )
    .join("")}</ol>`;
const marquee = () => {
  const items = [
    "Scan",
    "Pick what applied",
    "3–5 drafts",
    "Post to Google",
    "Fetch reviews",
    "AI reply",
    "Approve",
    "Publish",
  ];
  const track = items.map((item) => `<span>${e(item)}</span>`).join("");
  const set = `<div class="marquee-set">${track}</div>`;
  return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${set}${set}</div></div>`;
};
function layout({
  title,
  body,
  pathname,
  origin,
  privatePage = false,
  csrf = "",
  app = false,
  config = {},
  description = "ReviewKare collects customer reviews with a QR code and answers Google reviews with AI replies you approve and publish.",
}) {
  const meta = privatePage ? null : seo.metaFor(pathname);
  const pageTitle = meta ? meta.fullTitle : `${title} | ReviewKare`;
  const pageDescription = meta ? meta.description : description;
  const canonical = seo.absolute(
    origin,
    meta ? meta.canonicalPath : pathname,
  );
  const robots = meta
    ? meta.robots
    : privatePage
      ? "noindex, nofollow"
      : seo.INDEX;
  const faqs = pathname === "/faq" ? faq : null;
  const schema =
    meta && meta.indexable
      ? seo.schemaFor({ pathname, origin, config, faqs })
      : null;
  const schemaTag = schema
    ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`
    : "";
  const article = pathname.startsWith("/blog/")
    ? BLOG.article(pathname.replace(/^\/blog\//, ""))
    : null;
  const ogType = article ? "article" : "website";
  const verification = [
    config.verification && config.verification.google
      ? `<meta name="google-site-verification" content="${e(config.verification.google)}">`
      : "",
    config.verification && config.verification.bing
      ? `<meta name="msvalidate.01" content="${e(config.verification.bing)}">`
      : "",
  ].join("");
  const articleTags = article
    ? `<meta property="article:published_time" content="${e(article.date)}"><meta property="article:modified_time" content="${e(article.updated)}"><meta property="article:section" content="${e(article.topic)}"><meta property="article:author" content="ReviewKare">`
    : "";
  const scene = pathname === "/";
  const current = (href) =>
    href === "/app"
      ? pathname === "/app"
      : pathname === href || pathname.startsWith(href + "/");
  const publicNav = `<nav id="site-nav" aria-label="Main"><a href="/features">Features</a><a href="/pricing">Pricing</a><a href="/security">Security</a><a href="/faq">FAQ</a><a href="/contact">Contact</a><a class="button small" href="/login">Sign in</a></nav>`;
  const rail = [
    ["/app", "Overview"],
    ["/app/reviews", "Reviews"],
    ["/app/qr", "QR code"],
    ["/app/billing", "Billing"],
    ["/app/settings", "Settings"],
  ];
  const appShell = `<div class="app-frame"><aside class="app-rail">${wordmark()}<nav class="rail-nav" aria-label="Account"><span class="rail-label">Workspace</span>${rail
    .map(([href, label]) => navLink(href, label, current(href)))
    .join(
      "",
    )}</nav><div class="rail-foot"><p class="rail-note">Replies wait for your approval. Nothing posts on a timer.</p><form method="post" action="/api/auth/logout" data-api="/api/auth/logout"><button class="secondary" type="submit">Sign out</button><span class="status" role="status" aria-live="polite"></span></form></div></aside><div class="app-main"><header class="app-topbar"><p class="app-bar-title">ReviewKare / <strong>${e(title)}</strong></p><a class="button secondary small" href="/app">Workspace</a></header><main id="main" tabindex="-1">${body}</main></div></div>`;
  const publicShell = `<header class="site-header"><div class="header-inner">${wordmark()}<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>${publicNav}</div></header><main id="main" tabindex="-1">${body}</main><footer class="site-footer"><div class="footer-inner"><div class="footer-brand">${wordmark()}<p>Collect reviews with a QR code. Answer every Google review with an AI reply you approve and publish. A person stays on the final keystroke.</p><p class="mono muted">Review collection and reply management.</p></div><div class="footer-col"><h4>Product</h4><a href="/features">Features</a><a href="/pricing">Pricing</a><a href="/qr-kit">QR kit</a><a href="/for-agencies">For agencies</a></div><div class="footer-col"><h4>Resources</h4><a href="/faq">FAQ</a><a href="/blog">Guides</a><a href="/tools/google-review-link-generator">Review link tool</a><a href="/free-audit">Reputation audit</a><a href="/contact">Contact</a></div><div class="footer-col"><h4>Legal</h4><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refund-policy">Refund policy</a><a href="/security">Security</a></div></div><div class="footer-legal"><span>© 2026 ReviewKare</span><span>Publishing to Google requires a connected Business Profile. No ranking guarantees, no review gating, no automatic renewal.</span></div></footer>`;
  const guestShell = `<header class="site-header"><div class="header-inner">${wordmark()}</div></header><main id="main" tabindex="-1">${body}</main><footer class="site-footer guest-foot"><div class="footer-inner"><p>Reviews are written and posted by the customer. ReviewKare prepares drafts from what the guest selected and never publishes a review on their behalf.</p></div></footer>`;
  return `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(pageTitle)}</title><meta name="description" content="${e(pageDescription)}"><meta name="robots" content="${e(robots)}"><meta name="theme-color" content="#f7f4ec">${verification}<meta name="csrf-token" content="${e(csrf)}"><link rel="canonical" href="${e(canonical)}"><meta property="og:site_name" content="ReviewKare"><meta property="og:locale" content="en_IN"><meta property="og:title" content="${e(pageTitle)}"><meta property="og:description" content="${e(pageDescription)}"><meta property="og:url" content="${e(canonical)}"><meta property="og:type" content="${ogType}"><meta property="og:image" content="${e(origin)}/static/og-banner.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="ReviewKare: QR review collection and Google review replies"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(pageTitle)}"><meta name="twitter:description" content="${e(pageDescription)}"><meta name="twitter:image" content="${e(origin)}/static/og-banner.png">${articleTags}<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/static/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/static/app.css?v=4"><script src="/static/app.js?v=4" defer></script>${scene ? '<script src="/static/scene.js?v=4" defer></script>' : ""}${schemaTag}</head><body class="${app ? "is-app" : "is-public"}"><a class="skip" href="#main">Skip to content</a>${app ? appShell : pathname.startsWith("/q/") ? guestShell : publicShell}</body></html>`;
}
function auth(kind, token = "", returnTo = "/app") {
  const titles = {
    login: "Welcome back",
    signup: "Create your workspace",
    "forgot-password": "Reset your password",
    "reset-password": "Choose a new password",
    "verify-email": "Verify your email",
  };
  let body = "";
  if (kind === "login")
    body =
      form(
        "/api/auth/login",
        input("redirect", "Return to", "hidden", returnTo) +
          input(
            "email",
            "Business email",
            "email",
            "",
            'required autocomplete="username" maxlength="254"',
          ) +
          input(
            "password",
            "Password",
            "password",
            "",
            'required autocomplete="current-password" maxlength="128"',
          ),
        "Sign in",
      ) +
      '<div class="auth-links"><p><a href="/forgot-password">Forgot your password?</a></p><p>New here? <a href="/signup">Create an account</a>.</p></div>';
  if (kind === "signup")
    body =
      form(
        "/api/auth/signup",
        input(
          "clinicName",
          "Business name",
          "text",
          "",
          'required maxlength="120" autocomplete="organization"',
        ) +
          input(
            "ownerName",
            "Your name",
            "text",
            "",
            'required maxlength="100" autocomplete="name"',
          ) +
          input(
            "email",
            "Business email",
            "email",
            "",
            'required maxlength="254" autocomplete="email"',
          ) +
          input(
            "password",
            "Password (12–128 characters)",
            "password",
            "",
            'required minlength="12" maxlength="128" autocomplete="new-password"',
          ) +
          '<label class="check"><input type="checkbox" name="termsAccepted" required> I agree to the <a href="/terms">terms</a> and have read the <a href="/privacy">privacy notice</a>.</label>',
        "Start your workspace",
      ) +
      '<div class="auth-links"><p>No trial and no card at signup. Choose a plan when you are ready to draft.</p><p>Already have a workspace? <a href="/login">Sign in</a></p></div>';
  if (kind === "forgot-password")
    body =
      form(
        "/api/auth/forgot-password",
        input(
          "email",
          "Account email",
          "email",
          "",
          'required autocomplete="email"',
        ),
        "Request reset link",
      ) +
      '<div class="auth-links"><p>When email delivery is configured, eligible accounts receive a single-use reset link. If delivery is unavailable, this page will tell you.</p></div>';
  if (kind === "reset-password")
    body = form(
      "/api/auth/reset-password",
      input("token", "Reset token", "hidden", token) +
        input(
          "password",
          "New password (12–128 characters)",
          "password",
          "",
          'required minlength="12" maxlength="128" autocomplete="new-password"',
        ),
      "Reset password",
    );
  if (kind === "verify-email")
    body = form(
      "/api/auth/verify-email",
      input("token", "Verification token", "hidden", token),
      "Verify email",
    );
  const brand = `<div class="auth-brand">${wordmark()}<div><p class="eyebrow">Your workspace</p><h2>Collect the review. Approve the reply.</h2><p>One QR code for customers, one inbox for Google reviews, and a reply draft you edit before it goes public.</p><div class="auth-mini-stack" aria-hidden="true"><span>QR scan</span><span>Draft review</span><span>Google reply</span></div></div><p class="mono">Nothing posts without approval.</p></div>`;
  return `<section class="auth-page">${brand}<div class="auth-form"><p class="eyebrow">${e(kind.replaceAll("-", " "))}</p><h1>${e(titles[kind])}</h1>${body}</div></section>`;
}
const faqGroups = [
  [
    "Getting started",
    [
      [
        "What does ReviewKare actually do?",
        "Two things. A QR code lets customers compose a review from three to five drafts built only from what they select. Separately, it connects to Google Business Profile to fetch reviews, draft AI replies, and publish them once you approve.",
      ],
      [
        "Is there a free trial?",
        "No. Create the workspace first, then choose a plan when you are ready to draft. If checkout is enabled, it buys a fixed access period and never renews automatically.",
      ],
      [
        "Do my customers need an app or an account?",
        "No. The QR opens a web page with your business name, a rating picker, and the options you configured. There is no install, no login, and no account for the guest.",
      ],
      [
        "How long does setup take?",
        "Four steps: add your business name and Google Place ID, choose the guest options, print the QR, then connect Google Business Profile if you want direct publishing. The first two steps work without any Google approval.",
      ],
    ],
  ],
  [
    "The QR composer",
    [
      [
        "How does the QR review flow work?",
        "The guest scans the code, picks a rating, ticks the things that applied, and gets three to five drafts. They choose one, edit it, and post it to Google themselves. The drafts contain only their selections, so nothing is invented.",
      ],
      [
        "Can I change what guests can tick?",
        "Yes. Settings holds one option per line, up to eight, with presets for restaurants, cafés, gyms, salons, clinics, and retail. The customer page and the drafts update as soon as you save.",
      ],
      [
        "What do the drafts contain?",
        "Only the rating and the options the guest selected, plus any note they typed. Drafts are fixed templates, so they cannot invent staff names, prices, or details the guest never mentioned.",
      ],
      [
        "What if the guest had a bad visit?",
        "They still get drafts. A one-star rating produces honest critical wording, never a positive review carrying a low star rating. There is no gate that hides unhappy customers.",
      ],
      [
        "Is AI writing the customer reviews?",
        "No. Guest drafts are deterministic templates based on the rating and options selected. AI is used for replies to existing Google reviews, only after the workspace owner enables it, and every reply is editable.",
      ],
    ],
  ],
  [
    "Google reviews and replies",
    [
      [
        "What do I need to connect Google Business Profile?",
        "A Google account that manages the profile, and API access enabled by the operator. The refresh token is encrypted at rest and you can disconnect at any time. Without the connection, the copy-and-paste path still works.",
      ],
      [
        "How often are Google reviews fetched?",
        "On demand. Open the queue and sync, or let the workspace fetch when the connection is active. There is no background crawler and no scheduled posting.",
      ],
      [
        "Can I edit the reply before it goes out?",
        "Yes. Every draft is editable. Publishing sends the exact text you approve to the review you selected, and nothing posts on a timer.",
      ],
      [
        "What happens without a Google connection?",
        "The workspace still drafts replies. You copy the approved text and paste it into Google yourself, and the queue keeps the approved wording with the review.",
      ],
      [
        "Do you post reviews or replies without me?",
        "No. A guest always chooses and posts their own review. Replies wait for your approval, and publishing sends the exact text you approved. Nothing posts on a timer.",
      ],
    ],
  ],
  [
    "Billing, data, and limits",
    [
      [
        "Which languages are supported?",
        "Customer drafts and reply templates are English. A guest can type a note in any language and it is preserved in the draft.",
      ],
      [
        "What does a plan include?",
        "One workspace covers one location, one QR code, and one Google Business Profile. Plans differ by monthly reply and customer-draft allowances, and every plan is a fixed period rather than a subscription.",
      ],
      [
        "What happens when access ends?",
        "Drafting pauses, but export and account controls stay available. Nothing is deleted, and nothing renews automatically.",
      ],
      [
        "Where is my data stored?",
        "In the deployment's SQLite database, isolated per workspace. Google refresh tokens are encrypted at rest and can be removed by disconnecting at any time.",
      ],
    ],
  ],
];
const faq = faqGroups.flatMap(([, items]) => items);
function publicContent(pathname, config) {
  if (pathname === "/")
    return `<section class="hero"><div class="hero-copy"><p class="eyebrow">Review collection and reply management</p><h1 class="hero-title"><span class="w">Get</span> <span class="w">more</span> <span class="w">reviews,</span> <span class="w">answer</span> <span class="w">every</span> <span class="w">one.</span> <span class="hero-mark"><span class="mark">Without starting from a blank page.</span></span></h1><p class="lead">Two flows in one workspace. A QR code lets customers tick what applied and post a review from three to five drafts. Your Google reviews arrive with an AI reply already written — approve it and publish, or copy it yourself.</p><div class="actions"><a class="button" href="/signup">Create your workspace</a><a class="button secondary" href="/features">See both flows</a></div><ul class="hero-facts"><li>QR review drafts</li><li>Google review inbox</li><li>AI replies you approve</li><li>One location · no auto-renewal</li></ul></div><div class="hero-stage" data-scene><canvas id="scene" aria-hidden="true"></canvas><div class="scene-fallback" aria-hidden="true"><div class="fallback-stack"><div class="fb-card"><small>Step 01 · Scan</small><strong>Guest scans the QR</strong><i></i><i></i><i></i><span class="fb-chip">No app to install</span></div><div class="fb-card"><small>Step 02 · Compose</small><strong>3–5 drafts appear</strong><i></i><i></i><i></i><span class="fb-chip">Built from their picks</span></div><div class="fb-card"><small>Step 03 · Reply</small><strong>Google review answered</strong><i></i><i></i><i></i><span class="fb-chip">You approve the words</span></div></div></div><p class="vh">Scan, compose, post. Then reviews arrive, AI drafts the reply, and you approve and publish.</p></div></section>${marquee()}<section class="section"><div class="section-head"><p class="eyebrow">Both flows, end to end</p><h2>From a QR scan to a published reply, <span class="mark">with no hidden step.</span></h2><p>Flow one collects the review. Flow two answers it. Every stage is visible, reversible, and owned by a person.</p></div>${flow()}<p class="muted mono">Every rating gets the same Google link · No rating preselected · No invented details</p></section><section class="section"><div class="section-head"><p class="eyebrow">What’s included</p><h2>Everything between a customer’s first impression <span class="mark">and your public reply.</span></h2><p>Two products that share one workspace: a review collector for customers, and a reply desk for you.</p></div><div class="grid"><article class="card reveal"><span class="number">01</span><h3>QR review composer</h3><p>Guests scan, pick a rating and the things that applied, and get three to five first-person drafts. They edit the one they like and post it to Google themselves. Drafts are deterministic templates, so they never invent a detail.</p></article><article class="card reveal"><span class="number">02</span><h3>Guest options you control</h3><p>Choose a business type — café, gym, clinic, salon, store — and edit the list customers can tick. Food, service, ambience, waiting time: only what you actually offer appears.</p></article><article class="card reveal"><span class="number">03</span><h3>Google review inbox</h3><p>Connect Google Business Profile once. New reviews arrive with the reviewer, rating, and full text. Manual entry stays available for reviews from other platforms.</p></article><article class="card reveal"><span class="number">04</span><h3>AI replies you approve</h3><p>Each review is read for sentiment and topics, then a reply is drafted in your voice. Edit the wording before anything leaves the workspace. Nothing posts automatically.</p></article><article class="card reveal"><span class="number">05</span><h3>Publish or copy</h3><p>Approved replies publish straight to Google through the Business Profile API. If you have not connected Google, the copy button and direct link still work.</p></article><article class="card reveal"><span class="number">06</span><h3>Clear limits, stated up front</h3><p>One location per workspace. No review gating, no rating-conditioned rewards, no ranking guarantees, and no auto-renewing subscription.</p></article></div></section><section class="section"><div class="section-head"><p class="eyebrow">Built for local businesses</p><h2>If customers find you on Google, <span class="mark">this is for you.</span></h2><p>The composer presets match how each trade actually gets reviewed. Edit the list once and every guest sees the same options.</p></div><div class="chip-row chip-row-lg"><span class="chip-static">Restaurants</span><span class="chip-static">Cafés &amp; bakeries</span><span class="chip-static">Gyms &amp; studios</span><span class="chip-static">Salons &amp; spas</span><span class="chip-static">Clinics &amp; dentists</span><span class="chip-static">Retail stores</span><span class="chip-static">Repair shops</span><span class="chip-static">Local services</span></div></section><section class="section"><div class="section-head"><p class="eyebrow">Set-up</p><h2>Live in an afternoon, <span class="mark">not a fortnight.</span></h2></div><div class="grid grid-4"><article class="card reveal"><span class="number">01</span><h3>Add your business</h3><p>Name, city, and your Google Place ID. The QR link is generated for you.</p></article><article class="card reveal"><span class="number">02</span><h3>Pick guest options</h3><p>Choose a preset for your trade, then trim or extend the list customers can tick.</p></article><article class="card reveal"><span class="number">03</span><h3>Print the QR</h3><p>Download the vector code and poster. Test it on a phone before it reaches a counter.</p></article><article class="card reveal"><span class="number">04</span><h3>Connect Google</h3><p>Optional but recommended: fetch reviews and publish replies without leaving the workspace.</p></article></div></section><section class="section"><div class="limits"><div class="section-head"><p class="eyebrow">Clear limits</p><h2>Know exactly what this release does.</h2><p>ReviewKare collects reviews and prepares replies. It does not invent results, and it does not hide what is missing.</p></div><div class="limits-grid"><ul><li>One business location per workspace</li><li>QR composer with 3–5 grounded drafts</li><li>Google review fetch and publish</li><li>AI reply drafts with human approval</li></ul><ul><li>No multi-location dashboard or team seats</li><li>No WhatsApp, POS, or hardware automation</li><li>No review gating or rewards for ratings</li><li>No ranking guarantees or competitor analytics</li></ul></div><div class="actions"><a class="button secondary" href="/features">See the full scope</a><a class="button secondary" href="/security">Read the security notes</a></div></div></section><section class="section"><div class="section-head"><p class="eyebrow">Questions, answered plainly</p><h2>Say what happens. <span class="mark">Then do that.</span></h2></div><div class="faq">${faq
      .slice(0, 4)
      .map(
        ([q, a]) =>
          `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`,
      )
      .join("")}</div><p><a href="/faq">Read every question</a></p></section><section class="section"><div class="cta-band"><div><h2>Collect the review. Answer it the same day.</h2><p>One workspace, one QR code, and every Google review with a reply ready for your approval. Payment buys a fixed access period and never renews itself.</p></div><a class="button" href="/signup">Create your workspace</a></div></section>`;
  if (pathname === "/pricing")
    return `<section class="section flush"><div class="section-head"><p class="eyebrow">Pricing</p><h1>One workspace, two flows. <span class="mark">Never a surprise renewal.</span></h1><p class="lead">One location, one QR code, and one Google Business Profile per workspace. Plans differ by monthly reply and customer-draft capacity. Prices below are the final checkout total; no additional tax is added by this application. Tax treatment and invoice details must be confirmed by the operator before enabling sales.</p></div><p class="notice">${config.billingEnabled ? "Checkout is available. Every plan is a fixed period with no automatic renewal." : "Checkout is not enabled on this deployment. The workspace is created without a card and an operator can grant access."}</p><div class="pricing-grid">${Object.entries(
      PLANS,
    )
      .map(
        ([id, p]) =>
          `<article class="plan${id === "growth" ? " is-featured" : ""}">${id === "growth" ? '<span class="plan-flag">Most picked</span>' : ""}<h2>${e(p.name)}</h2><p class="price">${money(p.monthly)} <small>/ 30 days</small></p><p class="period">or ${money(p.annual)} for 365 days <span class="nowrap">&middot; no auto-renewal</span></p><ul><li>${p.reviews} review replies per calendar month</li><li>${p.drafts} customer QR drafts per calendar month</li><li>One location, one QR code</li><li>Google Business Profile sync and publishing</li></ul>${link("/signup", `Try ${p.name}`, id === "growth" ? "primary" : "secondary")}</article>`,
      )
      .join("")}</div><section class="split"><div><h2>What “fixed period” means</h2><p>Checkout, when enabled, purchases 30 or 365 days of access. No mandate is stored, and access does not renew automatically. You can export your data or delete the workspace at any time.</p></div><div><h2>Not included</h2><p>Multi-location dashboards, team seats, WhatsApp or POS automation, ranking guarantees, and competitor analytics are outside this release. See <a href="/features">features</a> for the complete scope.</p></div></section><section class="section"><div class="section-head"><p class="eyebrow">Billing questions</p><h2>What you pay, and what happens next.</h2></div><div class="faq"><details><summary>What does a plan unlock?</summary><p>Drafting for one workspace: customer QR drafts, Google review fetching, reply drafts, and publishing when a Business Profile is connected. Export and account controls stay available on every plan.</p></details><details><summary>Why is there no free trial?</summary><p>A trial hides the real decision behind a countdown. Creating the workspace is free, and you buy a fixed access period only when you are ready to draft.</p></details><details><summary>Does access renew by itself?</summary><p>No. Every plan is prepaid for 30 or 365 days. No mandate, card on file, or automatic charge is stored by this application.</p></details><details><summary>What happens when the period ends?</summary><p>Drafting pauses. Reviews, drafts, exports, and settings remain, and nothing is deleted automatically. You can buy another period or leave whenever you want.</p></details></div></section><div class="cta-band"><div><h2>One workspace. One fixed price.</h2><p>Create the workspace now and choose the period when you are ready to publish replies.</p></div><a class="button" href="/signup">Create your workspace</a></div></section>`;
  if (pathname === "/qr-kit")
    return `<section class="section flush"><div class="section-head"><p class="eyebrow">QR kit</p><h1>A review link that works <span class="mark">on paper.</span></h1><p class="lead">Download the vector QR, print the poster, and test the exact journey a customer sees. Every rating gets the same link and the same composer.</p></div><div class="grid"><article class="card reveal"><span class="number">01</span><h3>What you get</h3><p>An SVG QR that stays sharp at any size, a printable poster with your business name and destination, and the plain review URL for your own materials.</p></article><article class="card reveal"><span class="number">02</span><h3>What the guest gets</h3><p>A rating picker, the options you configured in Settings, and three to five editable drafts. They choose, edit, and post — no account, no app install.</p></article><article class="card reveal"><span class="number">03</span><h3>What it will not do</h3><p>No rating gate, no preselected stars, and no confirmation that a review was posted. The customer decides what to write and whether to publish.</p></article></div><section class="split"><div><h2>Where the code works best</h2><ul class="meta-list"><li>On the receipt or bill folder</li><li>At the counter, at eye level</li><li>On the table card or room key</li><li>At the end of a service, with a sentence of context</li></ul></div><div><h2>Before you print</h2><p>Set your real Google Place ID in Settings, choose the guest options, then open the customer journey on a phone. Download the QR only after both look right.</p><p class="mono muted">A printed code cannot be recalled. Re-print if the destination changes.</p></div></section><p class="notice">The printed QR points at this workspace. If the destination is wrong, reprint the poster.</p><div class="cta-band"><div><h2>Print one code. Collect the review. Answer it.</h2><p>Create a workspace, add your Place ID, and test the QR before it reaches a counter.</p></div><a class="button" href="/signup">Create your workspace</a></div></section>`;
  if (pathname === "/for-agencies")
    return `<section class="section flush"><div class="section-head"><p class="eyebrow">For agencies</p><h1>One workspace per location. <span class="mark">No shared logins.</span></h1><p class="lead">Run each client location as its own workspace: one owner account, one review queue, one QR code. This release does not offer team seats or delegated access.</p></div><div class="grid"><article class="card reveal"><span class="number">01</span><h3>Separate by design</h3><p>Every workspace is isolated server-side. Reviews, drafts, exports, and QR codes never cross between client locations.</p></article><article class="card reveal"><span class="number">02</span><h3>A clean handover</h3><p>Use the email that will own the workspace. If the client runs it day to day, use their address; if your team runs it, use yours. Never share a password — the owner can change it and revoke sessions in Settings.</p></article><article class="card reveal"><span class="number">03</span><h3>Billing without surprises</h3><p>If checkout is enabled, each workspace buys a fixed access period. Nothing renews automatically, and no card details are stored in this application.</p></article></div><div class="limits"><div class="section-head"><p class="eyebrow">Not offered in this release</p><h2>White-label, seats, and bulk tools are out of scope.</h2></div><p>There is no white-label branding, no multi-location dashboard, no role-based staff seats, and no bulk QR generation. Google Business Profile connection and publishing are supported per workspace.</p><div class="actions"><a class="button secondary" href="/features">See available features</a><a class="button secondary" href="/contact">Talk to us</a></div></div><section class="split"><div><p class="eyebrow">Handover</p><h2>How a handover works</h2><p>Each location is set up once and then belongs to its owner. Nothing is shared between client workspaces, including exports and QR codes.</p><ol class="mini-steps"><li><strong>Create with the client's email</strong><span>The owner controls password recovery from day one.</span></li><li><strong>Set the Place ID and options</strong><span>One location, one review queue, one QR code.</span></li><li><strong>Print and test the QR</strong><span>Open the guest journey on a phone before distribution.</span></li><li><strong>Hand over, then revoke</strong><span>The owner changes the password and signs out every other session.</span></li></ol></div><div class="settings-block"><h2>What each workspace needs</h2><ul class="meta-list"><li>A Google Place ID for that exact location</li><li>Three to eight guest options that fit the business</li><li>The email that will own the workspace after handover</li><li>Optional: a Google Business Profile connection for direct publishing</li></ul><p class="small muted">No shared logins, no delegated seats, and no cross-client reporting in this release.</p></div></section><div class="cta-band"><div><h2>Set up the first location today.</h2><p>Create a workspace, add its Place ID, and test the QR journey before you hand it over.</p></div><a class="button" href="/signup">Create a workspace</a></div></section>`;
  if (pathname === "/features")
    return `<section class="section flush"><div class="section-head"><p class="eyebrow">Features</p><h1>One product that <span class="mark">collects and answers reviews.</span></h1><p class="lead">Flow one turns a QR scan into a Google review. Flow two turns every Google review into a reply you approve. Both run from one workspace.</p></div><div class="split"><div><p class="eyebrow">Flow one</p><h2>The QR review composer</h2><p>You print a QR. A customer scans it, picks a rating, and ticks what actually applied — food, service, cleanliness, waiting time. ReviewKare returns three to five first-person drafts built only from those selections.</p><p>They choose one, edit it, and post it to Google themselves. There is no rating gate, no preselected stars, and no incentive offered for a positive review.</p><ul class="meta-list"><li>Presets for restaurants, cafés, gyms, salons, clinics, and retail</li><li>Editable option list, up to eight items</li><li>Three to five drafts per submission, never invented detail</li><li>Works without any AI provider or API key</li></ul></div><div class="card"><h3>What the guest sees</h3><ol class="mini-steps"><li><strong>Rate</strong><span>Five tiles, no default selected.</span></li><li><strong>Tick what applied</strong><span>The options you configured.</span></li><li><strong>Pick a draft</strong><span>Three to five options, editable.</span></li><li><strong>Post</strong><span>Copy, then open Google and paste.</span></li></ol></div></div></section><section class="section"><div class="split"><div class="card"><h3>What lands in your queue</h3><ol class="mini-steps"><li><strong>Fetch</strong><span>New reviews from Business Profile.</span></li><li><strong>Read</strong><span>Sentiment and topics detected.</span></li><li><strong>Draft</strong><span>A reply in your voice.</span></li><li><strong>Approve</strong><span>Edit, then publish to Google.</span></li></ol></div><div><p class="eyebrow">Flow two</p><h2>The Google review inbox</h2><p>Connect the Google account that manages your Business Profile. Reviews arrive with the reviewer name, rating, and full text. Each one is analysed for sentiment and topic, and a reply is drafted for you.</p><p>Edit the wording, then publish straight to Google. If the API is not enabled on this deployment, the copy button and direct link still work exactly the same way.</p><ul class="meta-list"><li>OAuth connection, refresh token encrypted at rest</li><li>Fetch on demand; no background crawler</li><li>AI drafts are opt-in and always editable</li><li>Publish sends the exact text you approved</li></ul></div></div></section><section class="section"><div class="section-head"><p class="eyebrow">Capabilities</p><h2>What you can run today.</h2></div><div class="grid"><article class="card reveal"><h2>QR composer</h2><p>Rating, configurable attributes, and three to five grounded drafts per guest. No AI key required.</p></article><article class="card reveal"><h2>Guest options</h2><p>Pick a trade preset, then edit the list. Only what you offer appears on the customer page.</p></article><article class="card reveal"><h2>Google inbox</h2><p>Fetch reviews from your Business Profile with reviewer, rating, text, and reply state.</p></article><article class="card reveal"><h2>AI reply drafts</h2><p>Sentiment and topic detection, then a reply in your voice. Enable it per workspace.</p></article><article class="card reveal"><h2>Publish to Google</h2><p>Send an approved reply to the exact review. The copy-and-paste path stays available.</p></article><article class="card reveal"><h2>Account controls</h2><p>Change your password, revoke sessions, export your data, or delete the workspace.</p></article></div></section><section class="section"><div class="section-head"><p class="eyebrow">The path</p><h2>Both flows, one visible loop.</h2></div>${flow()}</section><section class="section"><div class="limits"><div class="section-head"><p class="eyebrow">Not in this release</p><h2>We would rather be precise than impressive.</h2></div><p>Multi-location dashboards, team seats, WhatsApp and POS automation, hardware fulfilment, ranking guarantees, competitor analytics, and automatic dispute evidence are not offered. One workspace covers one location and one Google Business Profile.</p><div class="actions"><a class="button secondary" href="/pricing">See plans</a><a class="button secondary" href="/security">Security notes</a></div></div></section>`;
  if (pathname === "/faq")
    return `<section class="section flush"><div class="section-head"><p class="eyebrow">FAQ</p><h1>Frequently asked questions</h1><p class="lead">Plain answers about drafting, approval, QR handoff, AI, billing, and data. If something is still unclear, ask us directly.</p></div><div class="faq-grid">${faqGroups
      .map(
        ([group, items]) =>
          `<div><h2>${e(group)}</h2><div class="faq">${items
            .map(
              ([q, a]) =>
                `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`,
            )
            .join("")}</div></div>`,
      )
      .join(
        "",
      )}</div><div class="cta-band"><div><h2>Still deciding?</h2><p>Read the full feature list, check the fixed-period pricing, or send one question and get a straight answer.</p></div><a class="button" href="/contact">Ask a question</a></div></section>`;
  if (["/security", "/compliance"].includes(pathname))
    return eyebrowHead("Security", legal.security(config));
  if (["/privacy", "/dpdp-consent"].includes(pathname))
    return eyebrowHead("Privacy", legal.privacy(config));
  if (pathname === "/terms") return eyebrowHead("Terms", legal.terms(config));
  if (pathname === "/refund-policy")
    return eyebrowHead("Refunds", legal.refund(config));
  if (pathname === "/contact" || pathname === "/book-demo")
    return `<section class="split section flush"><div><p class="eyebrow">${pathname === "/contact" ? "Contact" : "Demo"}</p><h1>${pathname === "/contact" ? "Contact ReviewKare" : "Request a demo"}</h1><p class="lead">Submitting this form records a request. It does not create a calendar event or guarantee a meeting time.</p>${config.supportEmail ? `<p class="muted">You may also email ${e(config.supportEmail)}.</p>` : ""}<p class="mono muted">Do not include passwords, patient details, or payment-card data.</p></div><div class="card">${form(pathname === "/contact" ? "/api/contact" : "/api/book-demo", input("name", "Your name", "text", "", 'required maxlength="100" autocomplete="name"') + input("email", "Your email", "email", "", 'required maxlength="254" autocomplete="email"') + textarea("message", "How can we help?", "", 'required maxlength="2000"'), "Send request")}</div></section>`;
  if (pathname === "/free-audit")
    return `<section class="narrow section flush"><p class="eyebrow">Reputation audit</p><h1>A reputation audit you can run yourself</h1><p class="lead">No automated lookup runs on this page. This is the same checklist we would use, with the order that finds real problems first. Work through it once a quarter.</p><div class="card"><h2>1. Confirm the listing is correct</h2><p>Open your Business Profile and check the name, address, phone, hours, category, and website. A wrong category or a phone number that rings nowhere costs more than a missing review.</p><h2>2. Read the last twenty reviews, not the rating</h2><p>Sort by newest. Write down the repeated complaint in one sentence. If three people mention the same wait, that is an operations problem, not a review problem.</p><h2>3. Check which reviews have a reply</h2><p>Count the unanswered ones from the last 90 days. Replies are public. An unanswered complaint is read as indifference by the next customer, especially when it sits at the top of the list.</p><h2>4. Look at the reply quality</h2><p>Duplicate wording, arguments, and offers to remove a review all make a profile worse. A good reply names the specific problem and one concrete change.</p><h2>5. Check the path to a review</h2><p>Search for your business on a phone. If finding the review box takes more than two taps, the path is too long. A tested QR code removes that friction.</p><h2>6. Confirm the photos are current</h2><p>Old photos of a previous fit-out or a closed entrance create doubt. Add a few recent, honest photos of the space a customer actually sees.</p><h2>7. Write down one fix for this month</h2><p>One operational change, one reply backlog target, and one review-collection test. Anything longer becomes a document nobody opens.</p></div><section class="split"><div><h2>What it cannot tell you</h2><p>It produces no score, ranking position, share of voice, or review-count estimate. Those numbers require data this page does not collect. Treat any tool that invents them without a source as decoration.</p></div><div><h2>Where ReviewKare helps</h2><p>It shortens steps two and three: reviews arrive in one queue, each with an editable reply, and the QR composer gives customers a starting point. The audit judgment stays with you.</p>${link("/features", "See both flows")}</div></section><div class="cta-band"><div><h2>Fix the reply backlog first.</h2><p>Connect a Business Profile or draft replies by hand, then work down the oldest unanswered review.</p></div><a class="button" href="/signup">Create your workspace</a></div></section>`;
  if (pathname === "/blog") return blogIndex();
  if (pathname.startsWith("/blog/")) {
    const article = BLOG.article(pathname.slice("/blog/".length));
    if (article) return articlePage(article);
  }
  if (
    pathname === "/tools" ||
    pathname === "/tools/google-review-link-generator"
  )
    return `<section class="narrow section flush"><p class="eyebrow">Free tool</p><h1>Google review link generator</h1><p class="lead">Use the exact Place ID for your business, then test the link yourself before printing it.</p><div class="card"><form id="link-generator">${input("placeId", "Google Place ID", "text", "", 'required maxlength="200" pattern="(?:[A-Za-z0-9_]|-)+"')}<button type="submit">Create link</button><p role="status" class="status"></p></form></div><section class="split"><div><h2>How to use the link</h2><ol class="mini-steps"><li><strong>Find the Place ID</strong><span>Use Google's Place ID Finder for the exact location.</span></li><li><strong>Build the URL</strong><span>The tool returns a write-review link with your ID.</span></li><li><strong>Test it twice</strong><span>Once in a private window, once on a phone.</span></li><li><strong>Print only after that</strong><span>A printed code cannot be recalled.</span></li></ol></div><div><h2>What it does not do</h2><p>It does not confirm that a review was posted, it does not shorten the link, and it does not store the Place ID you enter. The generated URL opens Google's review box directly.</p><p><a href="/blog/find-google-place-id">Read the Place ID guide</a></p></div></section></section>`;
  if (pathname === "/offline")
    return `<section class="narrow section flush"><p class="eyebrow">Offline</p><h1>You are offline</h1><p class="lead">Reconnect to save changes. Unsaved changes have not been submitted.</p><div class="card"><h2>Nothing was sent</h2><p>This page was opened without a network connection. No draft was approved and no reply was published. Reconnect, then retry.</p><div class="actions"><button type="button" class="secondary" data-retry>Try again</button><a class="button secondary" href="/">Back to the site</a></div></div></section>`;
  return null;
}
function articlePage(article) {
  const related = BLOG.list()
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2)
    .map(
      (item) =>
        `<a class="post-card" href="/blog/${e(item.slug)}"><span class="tag">${e(item.topic)}</span><h3>${e(item.title)}</h3><p>${e(item.summary)}</p><span class="post-more">Read the guide</span></a>`,
    )
    .join("");
  return `<article class="prose article"><p class="eyebrow">${e(article.topic)}</p><h1>${e(article.title)}</h1><p class="article-meta"><time datetime="${e(article.date)}">${e(article.date)}</time> · ${Number(article.readMinutes) || 5} min read · ReviewKare</p>${article.body}<div class="article-cta cta-band"><div><h2>Put the guidance to work.</h2><p>Draft a reply, approve the exact wording, and publish it to Google — or copy it yourself.</p></div><a class="button" href="/signup">Create your workspace</a></div><aside class="related"><h2>Keep reading</h2><div class="post-grid">${related}</div></aside></article>`;
}
function blogIndex() {
  const posts = BLOG.list()
    .map(
      (article) =>
        `<a class="post-card" href="/blog/${e(article.slug)}"><span class="tag">${e(article.topic)}</span><h2>${e(article.title)}</h2><p>${e(article.summary)}</p><p class="article-meta"><time datetime="${e(article.date)}">${e(article.date)}</time> · ${Number(article.readMinutes) || 5} min read</p><span class="post-more">Read the guide</span></a>`,
    )
    .join("");
  return `<section class="section flush"><div class="section-head"><p class="eyebrow">Guides</p><h1>Reviews, replies, and the rules in between</h1><p class="lead">Three practical guides: how to answer a negative review, what a QR code can and cannot do, and how to build a review link that opens the right business.</p></div><div class="post-grid">${posts}</div><section class="split"><div><h2>Why these are short</h2><p>Each guide covers one narrow job and stops. No listicles, no invented statistics, and no claim that a reply will raise a rating.</p></div><div><h2>Need the tool instead?</h2><p>The review link generator builds a write-review URL from a Place ID and runs entirely in your browser.</p>${link("/tools/google-review-link-generator", "Open the link generator")}</div></section></section>`;
}
const VERTICAL_LABELS = {
  restaurant: "Restaurant",
  cafe: "Café or coffee shop",
  gym: "Gym or fitness studio",
  salon: "Salon or spa",
  clinic: "Clinic or practice",
  retail: "Shop or store",
  other: "Other business",
};
function guestPanel(store, config = {}) {
  const guest = config.guest || { vertical: "other", attributes: [] };
  const options = Object.entries(C.PRESETS)
    .map(
      ([id, preset]) =>
        `<option value="${e(id)}"${guest.vertical === id ? " selected" : ""}>${e(VERTICAL_LABELS[id] || id)} — ${e(preset.slice(0, 3).join(", "))}</option>`,
    )
    .join("");
  return `<section class="settings-block"><h2>Customer review composer</h2><p>What your customers see after scanning the QR. They pick a rating, tick the things that applied, and choose from three to five drafts. Change the list to match what you actually offer.</p>${form(
    "/api/settings",
    `<label>Business type<select name="vertical" aria-label="Business type">${options}</select></label><label>Things guests can tick<textarea name="guestAttributes" rows="5" maxlength="400">${e(guest.attributes.join("\n"))}</textarea></label><p class="small muted">One per line, up to eight. These are the only details a draft will mention.</p>`,
    "Save composer",
  )}</section>`;
}
function googlePanel(config = {}) {
  const google = config.google || {};
  const connection = google.connection || null;
  if (!google.enabled)
    return `<section class="settings-block"><h2>Google Business Profile</h2><p>Direct connection is switched off on this deployment. You can still draft replies here, copy them, and paste them into Google yourself.</p><p class="mono muted">Ask the operator to set GOOGLE_BUSINESS_ENABLED=true to turn on fetching and publishing.</p></section>`;
  if (!google.configured)
    return `<section class="settings-block"><h2>Google Business Profile</h2><p>Connection is enabled but incomplete. Missing: ${e((google.missing || []).join(", "))}.</p><p class="mono muted">Add the remaining values, restart, then reload this page.</p></section>`;
  const notices = {
    connected: "Google Business Profile connected.",
    denied: "Google access was cancelled. Nothing was connected.",
    exchange_failed: "Google rejected the sign-in. Nothing was connected.",
    no_refresh_token: "Google did not return offline access. Remove access in your Google account and try again.",
    no_location: "No Business Profile location was found on that account. Nothing was connected.",
    disconnected: "Google Business Profile disconnected.",
  };
  const notice = notices[google.notice]
    ? `<p class="status success">${e(notices[google.notice])}</p>`
    : "";
  if (!connection)
    return `<section class="settings-block"><h2>Google Business Profile</h2>${notice}<p>Connect the Google account that manages your Business Profile. ReviewKare then fetches new reviews and can publish the replies you approve.</p><p class="small muted">Access is read-and-reply only. The refresh token is encrypted at rest; you can disconnect at any time.</p><div class="actions"><a class="button" href="/api/google/connect">Connect Google Business Profile</a></div></section>`;
  return `<section class="settings-block"><h2>Google Business Profile</h2>${notice}<p>Connected to <strong>${e(connection.locationTitle || connection.locationName)}</strong>.</p><ul class="meta-list"><li>Connected ${e(connection.connectedAt.slice(0, 10))}</li><li>Last sync ${connection.lastSync ? e(connection.lastSync.slice(0, 16).replace("T", " ")) : "not yet"}</li>${connection.lastError ? `<li class="error">Last error: ${e(connection.lastError)}</li>` : ""}</ul><div class="actions">${form("/api/google/sync", "", "Fetch new reviews", 'data-reload="true"')}${form("/api/google/disconnect", "", "Disconnect", 'data-reload="true"')}</div></section>`;
}
function dashboard(store, section, config = {}) {
  const name = e(store.location.name),
    active = Date.parse(store.plan.expiresAt) > Date.now();
  const banner = `<p class="banner">${active ? `${e(store.plan.name)} · access until ${e(store.plan.expiresAt.slice(0, 10))}` : "Your access period has ended. Export and account controls remain available."} · ${config.google && config.google.connection ? "Google Business Profile connected." : "Copy-and-paste mode."}</p>`;
  if (section === "/app")
    return `<p class="eyebrow">Overview</p><h1>${name}</h1><p class="lead">Two flows, one workspace: guests compose a review from your QR, and Google reviews arrive with a reply ready for your approval.</p>${banner}<section class="stats"><article class="stat"><p class="stat-label">Reviews in the workspace</p><p class="stat-value" data-count="${Number(config.stats?.total) || 0}">${Number(config.stats?.total) || 0}</p><p>Fetched from Google or added by hand. ${Number(config.stats?.draft) || 0} still need a reply.</p>${link("/app/reviews", "Open the queue")}</article><article class="stat"><p class="stat-label">Guest drafts composed</p><p class="stat-value" data-count="${Number(store.qr.drafts) || 0}">${Number(store.qr.drafts) || 0}</p><p>${Number(store.qr.scans) || 0} QR page opens. Drafts are built only from what each guest selected.</p>${link("/app/qr", "Your review QR")}</article><article class="stat"><p class="stat-label">Google Business Profile</p><p class="stat-value">${config.google?.connection ? "Connected" : config.google?.enabled ? "Ready to connect" : "Manual mode"}</p><p>${config.google?.connection ? `Synced to ${e(config.google.connection.locationTitle || "your location")}.` : config.google?.enabled ? "Connect your profile to fetch reviews and publish replies." : "Draft and copy mode. Connect Google when the operator enables it."}</p>${link("/app/settings", "Review settings")}</article></section><section class="split"><div class="settings-block"><h2>Flow 1 — the QR composer</h2><p>A guest scans the code, picks a rating and the things that applied, and gets three to five drafts. They choose one, edit it, and post it to Google themselves. Nothing is invented and nothing posts for them.</p><p class="mono muted">${config.guest ? e(config.guest.attributes.length) + " options configured" : "Options configured in Settings"}</p>${link("/app/qr", "Open the QR kit")}</div><div class="settings-block"><h2>Flow 2 — the Google inbox</h2><p>Reviews are fetched from your Business Profile, analysed for sentiment and topics, and paired with a reply. Approve the wording and publish it to Google in one step.</p><p class="mono muted">${config.google?.connection ? "Publishing enabled for this workspace." : "Copy-and-paste fallback is always available."}</p>${link("/app/reviews", "Review and reply")}</div></section><section class="settings-block"><h2>Set-up checklist</h2><ol class="checklist"><li class="${store.location.placeId ? "done" : ""}"><strong>Set your Google Place ID</strong><span>${store.location.placeId ? "Done — your QR points at your Google review form." : "Needed before a printed QR can send guests to Google."}</span>${store.location.placeId ? "" : link("/app/settings", "Add Place ID")}</li><li class="${(config.guest?.attributes || []).length ? "done" : ""}"><strong>Choose the guest options</strong><span>${(config.guest?.attributes || []).length ? `Done — ${config.guest.attributes.length} options live.` : "Pick the things customers can tick, such as food, service, or cleanliness."}</span>${(config.guest?.attributes || []).length ? "" : link("/app/settings", "Configure")}</li><li class="${config.google?.connection ? "done" : ""}"><strong>Connect Google Business Profile</strong><span>${config.google?.connection ? "Done — reviews can be fetched and replies published." : "Optional. Without it you copy approved replies into Google yourself."}</span>${config.google?.connection ? "" : link("/app/settings", "Connect")}</li><li class="${Date.parse(store.plan.expiresAt) > Date.now() ? "done" : ""}"><strong>Unlock drafting</strong><span>${active ? "Access is active." : "Access has ended. Export and account controls remain available."}</span>${active ? "" : link("/app/billing", "Choose a plan")}</li></ol></section>`;
  if (section === "/app/reviews" || section === "/app/approvals") {
    const page = config.page || 1,
      current = config.reviews || [],
      total = config.total || 0,
      pageSize = config.pageSize || 20;
    return `<p class="eyebrow">Queue</p><h1>${section.endsWith("approvals") ? "Drafts needing review" : "Reviews and replies"}</h1><p class="lead">Google reviews arrive with a reply ready for you. Edit the wording, then publish it to Google or copy it yourself.</p>${banner}<details class="add-review"><summary>Add a review manually</summary>${form("/api/reviews", input("reviewerName", "Reviewer name", "text", "", 'required maxlength="100"') + '<label>Rating<select name="rating" aria-label="Rating" required><option value="">Choose rating</option>' + [1, 2, 3, 4, 5].map((n) => `<option value="${n}">${n} ${n === 1 ? "star" : "stars"}</option>`).join("") + "</select></label>" + textarea("text", "Review text", "", 'maxlength="4000"'), "Create reply draft")}</details><div class="review-list">${current.map((r) => `<article class="card review"><div class="review-head"><h2>${e(r.reviewerName)} · ${r.rating}/5</h2>${stars(r.rating)}</div><p class="preserve">${e(r.text || "Rating only")}</p><p class="review-meta"><span class="tag">${e(r.source === "google" ? "Google review" : "Added by hand")}</span><span class="tag">${e(r.reply.status)}</span>${r.googleReplyState ? `<span class="tag">${e(r.googleReplyState === "posted" ? "Replied on Google" : "Publish failed")}</span>` : ""}<span>${e(String(r.createdAt || "").slice(0, 10))}</span></p>${form(`/api/reviews/${encodeURIComponent(r.id)}/reply`, textarea("text", "Reply draft", r.reply.finalText || r.reply.draftText, 'required maxlength="2000" data-reply-text="' + e(r.id) + '"') + '<label>Action<select name="action" aria-label="Action"><option value="approve">Approve this draft for copying</option><option value="regenerate">Regenerate template</option></select></label>', "Save draft", 'data-method="PATCH"')}<div class="actions"><button type="button" data-copy-target="reply-${e(r.id)}" class="secondary">Copy reply</button>${link(`/app/reviews/${encodeURIComponent(r.id)}/approval-link`, "Create approval link")}</div><p class="copy-note">Plain-text copy buffer</p><textarea class="copy-source" id="reply-${e(r.id)}" aria-label="Copyable reply text" readonly>${e(r.reply.finalText || r.reply.draftText)}</textarea>${r.googleReviewId ? `<div class="publish-block">${config.google && config.google.connection ? form(`/api/reviews/${encodeURIComponent(r.id)}/publish`, '<p class="small muted">Publishing sends this exact text to your Google Business Profile. It appears publicly.</p>', "Publish reply to Google", 'data-reload="true"') : `<p class="small muted">Connect Google Business Profile in Settings to publish this reply directly. Until then, copy it into Google yourself.</p>`}</div>` : ""}${aiPanel(r, (config.candidatesByReview || {})[r.id], config.ai)}${form(`/api/reviews/${encodeURIComponent(r.id)}`, input("confirm", "Confirm", "hidden", "delete"), "Delete review", 'data-method="DELETE"')}</article>`).join("") || '<p class="muted">No reviews in this view yet.</p>'}</div><nav class="actions" aria-label="Review pages">${page > 1 ? link(`${section}?page=${page - 1}`, "Previous") : ""}${page * pageSize < total ? link(`${section}?page=${page + 1}`, "Next") : ""}</nav>`;
  }
  if (section === "/app/qr" || section === "/app/posters") {
    const destination = config.origin + "/q/" + store.qr.code;
    const options =
      (config.guest && config.guest.attributes) ||
      C.presetFor((config.guest && config.guest.vertical) || "other");
    return `<p class="eyebrow">Customer journey</p><h1>Your business review QR</h1><p class="lead">One QR for ${name}. Guests scan it, pick a rating and the things that applied, then choose from three to five drafts they can edit and post.</p>${banner}${store.location.placeId ? `<div class="qr-card"><div class="qr-preview"><img src="/api/qr.svg" width="280" height="280" alt="Review QR for ${name}"></div><div><p class="mono muted">Destination</p><p class="break">${e(destination)}</p><div class="actions">${link("/api/qr.svg?download=1", "Download QR SVG")}${link("/app/qr/print", "Open printable poster")}${link("/q/" + store.qr.code, "Test customer journey")}</div><p class="small muted">The printed QR points to this workspace. Test it with a phone before distribution. Printing uses your browser's print dialog, which may offer Save as PDF.</p></div></div>` : `<p class="notice">Configure your real Google Place ID before generating a printable QR.</p>${link("/app/settings", "Set review destination")}`}<section class="stats"><article class="stat"><p class="stat-label">QR page opens</p><p class="stat-value" data-count="${Number(store.qr.scans) || 0}">${Number(store.qr.scans) || 0}</p><p>Guests who opened this code's composer.</p></article><article class="stat"><p class="stat-label">Drafts composed</p><p class="stat-value" data-count="${Number(store.qr.drafts) || 0}">${Number(store.qr.drafts) || 0}</p><p>Times a guest asked for drafts after scanning.</p></article><article class="stat"><p class="stat-label">Guest options</p><p class="stat-value" data-count="${options.length}">${options.length}</p><p>The things a guest can tick. Up to eight.</p></article></section><section class="split"><div class="settings-block"><h2>What guests can pick</h2><p>These are the only details a draft can mention. If it is not on this list, no draft will claim it.</p><div class="chip-row-lg">${options
      .map((option) => `<span class="chip-static">${e(option)}</span>`)
      .join("")}</div><p class="small muted">Keep three to eight options. A short list is easier to answer on a phone.</p><div class="actions">${link("/app/settings", "Edit guest options")}</div></div><div class="settings-block"><h2>After the scan</h2><ol class="mini-steps"><li><strong>Rate the visit</strong><span>Five tiles, no default selected.</span></li><li><strong>Tick what applied</strong><span>Only the options configured here.</span></li><li><strong>Pick and edit a draft</strong><span>Three to five drafts, never invented detail.</span></li><li><strong>Post on Google</strong><span>The guest copies and posts it themselves.</span></li></ol></div></section><section class="settings-block"><h2>Where the code works</h2><ul class="meta-list"><li>On the receipt or bill folder, with one sentence of context</li><li>At the counter, at eye level where a phone can reach it</li><li>On the table card, room key, or locker</li><li>At the end of a service, before the customer leaves</li></ul><p class="small muted">A printed code cannot be recalled. If the destination or business name changes, reprint the poster.</p></section>`;
  }
  if (section === "/app/settings")
    return `<p class="eyebrow">Settings</p><h1>Workspace settings</h1><p class="lead">Business identity, AI consent, account security, and data controls — each in one place.</p>${banner}<section class="settings-block"><h2>Business details</h2><p class="muted">Review links stay disabled until a Google Place ID is set.</p>${form("/api/settings", input("name", "Business name", "text", store.location.name, 'required maxlength="120"') + input("city", "City", "text", store.location.city, 'maxlength="100"') + input("placeId", "Google Place ID", "text", store.location.placeId, 'maxlength="200" pattern="(?:[A-Za-z0-9_]|-)*"') + "<p>Confirm that this Place ID belongs to your business.</p>", "Save settings")}</section>${guestPanel(store, config)}${googlePanel(config)}${aiSettings(store, config.ai)}<section class="settings-block"><h2>Verify your account email</h2><p>${store.emailVerified ? "Your email is verified." : "Verification is required before payment."}</p>${form("/api/auth/resend-verification", "", "Send verification email")}</section><section class="settings-block"><h2>Change password</h2>${form("/api/auth/change-password", `<input class="vh" type="text" name="username" autocomplete="username" value="${e(store.user.email)}" tabindex="-1" aria-hidden="true">` + input("currentPassword", "Current password", "password", "", 'required autocomplete="current-password"') + input("password", "New password (12–128 characters)", "password", "", 'required minlength="12" maxlength="128" autocomplete="new-password"'), "Change password and sign out")}</section><section class="settings-block"><h2>Sessions and data</h2><p>Revoke every session or download a copy of this workspace.</p><div class="actions">${form("/api/auth/revoke-sessions", "", "Sign out all sessions")}${link("/api/account/export", "Download workspace data")}</div></section><section class="settings-block"><h2>Delete workspace</h2><p>Deletion removes your workspace and account. Payment records may be retained for accounting. This cannot be undone.</p>${form("/api/account/delete", `<input class="vh" type="text" name="username" autocomplete="username" value="${e(store.user.email)}" tabindex="-1" aria-hidden="true">` + input("password", "Confirm password", "password", "", 'required autocomplete="current-password"') + input("confirmation", "Type DELETE", "text", "", 'required pattern="DELETE"'), "Delete my workspace", 'data-destructive="true"')}</section>`;
  if (section === "/app/billing") {
    const plan = PLANS[store.plan.tier] || null;
    const expiresAt = store.plan.expiresAt
      ? Date.parse(store.plan.expiresAt)
      : 0;
    const daysLeft = expiresAt
      ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 86400000))
      : 0;
    const month = new Date().toISOString().slice(0, 7);
    const usage =
      store.usage && store.usage.month === month
        ? store.usage
        : { replies: 0, drafts: 0 };
    const limits = plan || PLANS.basic;
    const accessState = active
      ? `<p class="plan-state">${plan ? e(plan.name) : e(store.plan.name)} active</p><h2>${daysLeft} ${daysLeft === 1 ? "day" : "days"} of access left</h2><p>${
          store.plan.status === "granted"
            ? "This period was granted by the operator and has no payment attached."
            : "This period was purchased and is prepaid."
        } It ends on ${e(String(store.plan.expiresAt).slice(0, 10))} and does not renew.</p>`
      : `<p class="plan-state">No active access</p><h2>Drafting is paused</h2><p>Reviews, drafts, exports, and settings stay available. Buy a period below, or ask the operator for a grant, to start drafting again.</p>`;
    return `<p class="eyebrow">Billing</p><h1>Billing and access</h1><p class="lead">What this workspace has, how much of the month is used, and every payment on record. Nothing renews automatically.</p>${banner}<section class="settings-block">${accessState}<ul class="meta-list"><li>Plan: ${plan ? e(plan.name) : "No plan purchased"}</li><li>Status: ${e(String(store.plan.status).replace(/^./, (c) => c.toUpperCase()))}</li><li>Period ${expiresAt ? "ends " + e(String(store.plan.expiresAt).slice(0, 10)) : "not started"}</li><li>Renewal: never automatic</li></ul></section><section class="split"><div class="settings-block"><h2>This month's use</h2><p class="muted">Counters reset on the first day of each calendar month. Current month: ${e(month)}.</p><label class="small" for="usage-replies">Review replies</label><progress class="usage" id="usage-replies" max="${limits.reviews}" value="${Math.min(usage.replies, limits.reviews)}">${usage.replies} of ${limits.reviews}</progress><p class="small muted">${usage.replies} of ${limits.reviews} used · ${Math.max(0, limits.reviews - usage.replies)} left${usage.replies >= limits.reviews ? " · limit reached" : ""}</p><label class="small" for="usage-drafts">Customer QR drafts</label><progress class="usage" id="usage-drafts" max="${limits.drafts}" value="${Math.min(usage.drafts, limits.drafts)}">${usage.drafts} of ${limits.drafts}</progress><p class="small muted">${usage.drafts} of ${limits.drafts} used · ${Math.max(0, limits.drafts - usage.drafts)} left${usage.drafts >= limits.drafts ? " · limit reached" : ""}</p><p class="small muted">Counters are shown against ${plan ? "your current plan" : "the Basic plan"} so an expired workspace still has a reference point.</p></div><div class="settings-block"><h2>When the period ends</h2><ol class="mini-steps"><li><strong>Drafting pauses</strong><span>QR drafts and reply drafts stop. Nothing is deleted.</span></li><li><strong>Everything stays readable</strong><span>Reviews, approved replies, receipts, and exports remain.</span></li><li><strong>You choose what happens</strong><span>Buy another period, export the workspace, or leave.</span></li></ol></div></section><section class="settings-block"><div class="section-head"><p class="eyebrow">Plans</p><h2>One fixed price per period.</h2><p class="muted">Prices are the checkout total for this deployment. Monthly counters reset each calendar month; the access period is what you buy.</p></div><div class="pricing-grid">${Object.entries(
      PLANS,
    )
      .map(
        ([id, p]) =>
          `<article class="plan${store.plan.tier === id ? " is-featured" : ""}">${store.plan.tier === id ? '<span class="plan-flag">Current plan</span>' : ""}<h2>${e(p.name)}</h2><p class="price">${money(p.monthly)} <small>/ 30 days</small></p><p class="period">or ${money(p.annual)} for 365 days</p><ul><li>${p.reviews} review replies per month</li><li>${p.drafts} customer QR drafts per month</li><li>One location, one QR code</li></ul>${
            config.billingEnabled
              ? form(
                  "/api/billing/create-order",
                  input("planId", "Plan", "hidden", id) +
                    `<label>Access period<select name="billingCycle" aria-label="Access period for ${e(p.name)}"><option value="monthly">30 days · ${money(p.monthly)}</option><option value="annual">365 days · ${money(p.annual)}</option></select></label>`,
                  `Buy ${p.name}`,
                )
              : '<p class="small muted">Checkout is disabled on this deployment.</p>'
          }</article>`,
      )
      .join("")}</div><p class="small muted">No card or mandate is stored by this application. Tax treatment and invoice details must be confirmed by the operator before sales are enabled.</p><p><a href="/pricing">Full pricing details</a></p></section><section class="settings-block"><h2>Payment receipts</h2>${store.receipts.map((r) => `<article class="receipt"><h3>${e(r.planName)} · ${money(r.amount)}</h3><p>${e(r.paidAt)} · Receipt ${e(r.id)}</p><p>Payment acknowledgement, not a GST tax invoice. Contact the operator for tax documentation.</p>${form("/api/billing/refund-request", input("paymentId", "Payment", "hidden", r.paymentId) + textarea("reason", "Reason for refund request", "", 'required maxlength="1000"'), "Request refund review")}</article>`).join("") || '<p class="muted">No payments recorded.</p>'}<p><a href="/refund-policy">Refund request policy</a></p></section>`;
  }
  if (section === "/app/staff")
    return `<p class="eyebrow">Team</p><h1>Staff directory</h1><p class="lead">Names are optional. No ratings, compliments, or performance are invented.</p>${store.staff.map((s) => `<article class="card"><h2>${e(s.name)}</h2><p>${e(s.role)}</p></article>`).join("")}${form("/api/staff", input("name", "Staff name", "text", "", 'required maxlength="100"') + input("role", "Role", "text", "", 'required maxlength="100"'), "Add staff member")}`;
  if (section === "/app/reports")
    return `<p class="eyebrow">Report</p><h1>Workspace report</h1><p class="lead">${config.total || 0} manually entered reviews · ${store.qr.scans} QR page opens · ${store.qr.drafts} draft requests.</p><p class="notice">These are local counters, not Google ranking, verified publication, or conversion measurements.</p>${link("/api/account/export", "Export workspace data")}`;
  return `<p class="eyebrow">Unavailable</p><h1>Feature unavailable</h1><p>This capability is not implemented in this release. No provider operation, analysis, order, or delivery has been performed.</p>${link("/app", "Back to workspace")}`;
}
const RATING_WORDS = ["Poor", "Fair", "Good", "Great", "Excellent"];
function attributeChips(attributes) {
  return attributes
    .map(
      (label, index) =>
        `<label class="chip"><input type="checkbox" name="attributes" value="${e(label)}" id="attr-${index}"><span>${e(label)}</span></label>`,
    )
    .join("");
}
function customer(store, options = {}) {
  const name = e(store.location.name);
  const vertical = (store.guest && store.guest.vertical) || "other";
  const configured =
    store.guest && Array.isArray(store.guest.attributes)
      ? store.guest.attributes
      : [];
  const attributes = (
    configured.length ? configured : C.presetFor(vertical)
  ).slice(0, 8);
  const google = store.location.placeId
    ? "https://search.google.com/local/writereview?placeid=" +
      encodeURIComponent(store.location.placeId)
    : "";
  const noun = C.NOUNS[vertical] || "visit";
  return `<div class="customer-page"><p class="eyebrow">Your experience, your words</p><h1>How was your ${e(noun)} at ${name}?</h1><p class="lead">Choose a rating, tick the things that actually applied, and we will prepare three to five drafts. You pick one, edit it, and post it yourself. Nothing is published for you.</p><div class="customer-card"><form method="post" action="/api/qr/drafts" data-api="/api/qr/drafts" id="customer-draft">${input("shortCode", "QR code", "hidden", store.qr.code)}<fieldset class="fieldset"><legend>Your rating</legend><div class="rating-options">${[1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<label><input type="radio" name="rating" value="${n}" required><span>${n}</span><small>${RATING_WORDS[n - 1]}</small></label>`,
    )
    .join(
      "",
    )}</div></fieldset><fieldset class="fieldset"><legend>What applied today?</legend><p class="field-hint">Pick up to five. These are the only things the drafts will mention.</p><div class="chip-row">${attributeChips(attributes)}</div></fieldset><label class="field">Anything else you want to say? <span class="field-note">Optional</span><textarea name="note" rows="3" maxlength="600" placeholder="Your own words. Only your own experience; no private or medical details."></textarea></label>${message}<button type="submit">Show me 3–5 drafts</button><p class="small muted">Drafts are built from your rating and the options you tick, so they cannot invent details. You can edit everything before posting.</p></form></div><section id="draft-result" class="customer-card customer-next" hidden aria-live="polite"><h2>Pick a draft, then make it yours</h2><p class="muted">Each draft uses only what you selected. Choose one to load it into the editor.</p><div class="draft-options" id="draft-options" role="radiogroup" aria-label="Draft options"></div><label class="field">Your review<textarea id="customer-text" rows="6" maxlength="2000"></textarea></label><label class="check"><input type="checkbox" id="confirm-experience"> This reflects my own experience and I have checked the text.</label><div class="actions"><button type="button" id="copy-customer">Copy my review</button>${google ? `<a class="button secondary" href="${e(google)}" rel="noopener" target="_blank">Open Google to paste and post</a>` : ""}</div><p class="status" role="status" id="copy-status"></p><p class="small muted">Opening Google does not confirm that a review was published. Pasting and submitting is up to you.</p></section><section class="customer-card customer-direct"><h2>Prefer to write it yourself?</h2><p>Skip the drafts and go straight to Google. The same link works at every rating, and nothing is written on your behalf.</p>${google ? `<a class="button secondary" href="${e(google)}" rel="noopener" target="_blank">Write a review on Google</a>` : '<p class="notice">The business has not set its Google destination yet. Ask the team for their review link.</p>'}</section></div>`;
}
module.exports = {
  layout,
  auth,
  publicContent,
  dashboard,
  customer,
  input,
  textarea,
  form,
  link,
  faq,
};
