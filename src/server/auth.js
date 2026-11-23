"use strict";
const crypto = require("node:crypto");
const S = require("./security");

function createAuth(origin, env = process.env, fetcher = fetch) {
  const serviceUrl = new URL(env.SUPABASE_URL);
  if (
    serviceUrl.protocol !== "https:" ||
    serviceUrl.username ||
    serviceUrl.password ||
    serviceUrl.pathname !== "/" ||
    serviceUrl.search ||
    serviceUrl.hash
  )
    throw new Error("SUPABASE_URL must be an HTTPS project origin.");
  const key = env.SUPABASE_ANON_KEY;
  if (!key) throw new Error("SUPABASE_ANON_KEY is required for Supabase Auth.");
  const endpoint = serviceUrl.origin + "/auth/v1";
  const callback = origin + "/auth/callback";

  async function request(
    path,
    body,
    { method = "POST", token, admin = false } = {},
  ) {
    const apiKey = admin ? env.SUPABASE_SERVICE_ROLE_KEY : key;
    if (!apiKey)
      S.fail(503, "Account deletion requires operator configuration.");
    let response;
    try {
      response = await fetcher(endpoint + path, {
        method,
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
          ...(token || admin
            ? { Authorization: "Bearer " + (token || apiKey) }
            : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "error",
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      S.fail(503, "Account service is temporarily unavailable.");
    }
    if (response.status === 429)
      S.fail(429, "Too many account requests. Try again later.");
    if (response.status >= 500)
      S.fail(503, "Account service is temporarily unavailable.");
    if (!response.ok)
      S.fail(
        400,
        "The account request was declined. Check your details or request a fresh link.",
      );
    if (response.status === 204) return {};
    return response.json();
  }

  return {
    signup: (email, password, profile) =>
      request("/signup?redirect_to=" + encodeURIComponent(callback), {
        email,
        password,
        data: profile,
      }),
    login: async (email, password) => {
      try {
        return await request("/token?grant_type=password", { email, password });
      } catch (error) {
        if (error.status === 400)
          S.fail(401, "Invalid credentials or email awaiting verification.");
        throw error;
      }
    },
    async authenticateAdmin(email, password, code, isAdmin) {
      const first = await this.login(email, password);
      if (!first.user?.email_confirmed_at || !first.access_token || !await isAdmin(first.user.id))
        S.fail(401, "Administrator credentials could not be verified.");
      const identity = await request("/user", undefined, { method: "GET", token: first.access_token });
      const factor = identity?.factors?.find(item => item.factor_type === "totp" && item.status === "verified");
      if (identity?.id !== first.user.id || !factor?.id)
        S.fail(401, "A verified authenticator is required.");
      const path = "/factors/" + encodeURIComponent(factor.id);
      const challenge = await request(path + "/challenge", {}, { token: first.access_token });
      if (!challenge?.id) S.fail(401, "Authenticator challenge was unavailable.");
      const verified = await request(path + "/verify", { challenge_id: challenge.id, code }, {
        token: first.access_token,
      });
      let claims;
      try {
        claims = JSON.parse(Buffer.from(verified.access_token.split(".")[1], "base64url"));
      } catch {
        S.fail(401, "Authenticator verification was incomplete.");
      }
      // This token comes directly from the configured Supabase service over TLS.
      if (claims.sub !== identity.id || claims.aal !== "aal2" || !await isAdmin(identity.id))
        S.fail(401, "Administrator credentials could not be verified.");
      return identity.id;
    },
    resend: (email) => request("/resend", { email, type: "signup" }),
    recover: (email) =>
      request("/recover?redirect_to=" + encodeURIComponent(callback), {
        email,
      }),
    verify: (tokenHash, type) =>
      request("/verify", { token_hash: tokenHash, type }),
    changePassword: (token, password) =>
      request("/user", { password }, { method: "PUT", token }),
    deleteUser: (id) =>
      request("/admin/users/" + encodeURIComponent(id), undefined, {
        method: "DELETE",
        admin: true,
      }),
    googleUrl(verifier) {
      const url = new URL(endpoint + "/authorize");
      url.search = new URLSearchParams({
        provider: "google",
        redirect_to: callback,
        code_challenge: crypto
          .createHash("sha256")
          .update(verifier)
          .digest("base64url"),
        code_challenge_method: "s256",
      });
      return url.href;
    },
    exchange: (code, verifier) =>
      request("/token?grant_type=pkce", {
        auth_code: code,
        code_verifier: verifier,
      }),
  };
}

module.exports = { createAuth };
