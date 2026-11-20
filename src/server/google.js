// @ts-check
"use strict";
/**
 * Google Business Profile integration.
 *
 * Everything here is configuration-gated: when GOOGLE_BUSINESS_ENABLED is not
 * "true" the routes are not registered and the product falls back to the
 * copy-and-paste workflow. No credential is ever logged.
 *
 * The module takes an injectable `fetch` so the whole flow can be tested
 * without network access or a real Google Cloud project.
 */
const crypto = require("node:crypto");

const ENDPOINTS = {
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  accounts: "https://mybusinessaccountmanagement.googleapis.com/v1",
  locations: "https://mybusinessbusinessinformation.googleapis.com/v1",
  reviews: "https://mybusiness.googleapis.com/v4",
  scope: "https://www.googleapis.com/auth/business.manage",
};

const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

function readConfig(env = process.env) {
  const clientId = String(env.GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = String(env.GOOGLE_CLIENT_SECRET || "").trim();
  const redirectUri = String(env.GOOGLE_REDIRECT_URI || "").trim();
  const key = String(env.TOKEN_ENCRYPTION_KEY || "").trim();
  const enabled = env.GOOGLE_BUSINESS_ENABLED === "true";
  const missing = [];
  if (!clientId) missing.push("GOOGLE_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (!redirectUri) missing.push("GOOGLE_REDIRECT_URI");
  if (!key) missing.push("TOKEN_ENCRYPTION_KEY");
  return {
    enabled,
    configured: missing.length === 0,
    missing,
    clientId,
    clientSecret,
    redirectUri,
    encryptionKey: key,
    scope: String(env.GOOGLE_SCOPE || "").trim() || ENDPOINTS.scope,
    endpoints: ENDPOINTS,
  };
}

function keyBuffer(config) {
  const key = Buffer.from(config.encryptionKey, "base64");
  if (key.length !== 32)
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be 32 bytes, base64 encoded (openssl rand -base64 32).",
    );
  return key;
}

/** Encrypt a refresh token before it touches the database. */
function seal(plain, config) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer(config), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plain), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function open(sealed, config) {
  const [version, iv, tag, payload] = String(sealed).split(".");
  if (version !== "v1" || !iv || !tag || !payload)
    throw new Error("Stored Google credential is not readable.");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    keyBuffer(config),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(payload, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function authUrl(state, config) {
  const url = new URL(config.endpoints.authUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

async function readJson(response, label) {
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const detail =
      (payload && (payload.error_description || payload.error?.message)) ||
      text.slice(0, 200) ||
      response.statusText;
    const error = /** @type {Error & { status?: number }} */ (
      new Error(`${label} failed (${response.status}): ${detail}`)
    );
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function tokenRequest(params, config, fetchImpl) {
  const response = await fetchImpl(config.endpoints.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  return readJson(response, "Google token exchange");
}

async function exchangeCode(code, config, fetchImpl = fetch) {
  const payload = await tokenRequest(
    {
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    },
    config,
    fetchImpl,
  );
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || "",
    expiresIn: Number(payload.expires_in) || 3600,
    scope: payload.scope || "",
    idToken: payload.id_token || "",
  };
}

async function refreshAccessToken(refreshToken, config, fetchImpl = fetch) {
  const payload = await tokenRequest(
    {
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
    },
    config,
    fetchImpl,
  );
  return {
    accessToken: payload.access_token,
    expiresIn: Number(payload.expires_in) || 3600,
    scope: payload.scope || "",
  };
}

function bearer(accessToken) {
  return { authorization: `Bearer ${accessToken}`, accept: "application/json" };
}

async function listAccounts(accessToken, config, fetchImpl = fetch) {
  const response = await fetchImpl(
    `${config.endpoints.accounts}/accounts?pageSize=20`,
    { headers: bearer(accessToken) },
  );
  const payload = await readJson(response, "Listing Google accounts");
  return (payload?.accounts || []).map((account) => ({
    name: account.name,
    label: account.accountName || account.name,
    type: account.type || "",
  }));
}

async function listLocations(accessToken, accountName, config, fetchImpl = fetch) {
  const url = new URL(`${config.endpoints.locations}/${accountName}/locations`);
  url.searchParams.set("readMask", "name,title,storeCode,storefrontAddress");
  url.searchParams.set("pageSize", "100");
  const response = await fetchImpl(url.toString(), {
    headers: bearer(accessToken),
  });
  const payload = await readJson(response, "Listing Google locations");
  return (payload?.locations || []).map((location) => ({
    name: location.name,
    title: location.title || location.name,
  }));
}

function starValue(value) {
  if (typeof value === "number") return Math.min(5, Math.max(1, value));
  return STARS[String(value || "").toUpperCase()] || 0;
}

async function listReviews(accessToken, connection, config, fetchImpl = fetch) {
  const url = new URL(
    `${config.endpoints.reviews}/${connection.accountName}/${connection.locationName}/reviews`,
  );
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("orderBy", "updateTime desc");
  const response = await fetchImpl(url.toString(), {
    headers: bearer(accessToken),
  });
  const payload = await readJson(response, "Fetching Google reviews");
  return (payload?.reviews || []).map((review) => ({
    googleReviewId: review.reviewId,
    reviewerName:
      (review.reviewer && review.reviewer.displayName) || "Google reviewer",
    rating: starValue(review.starRating),
    text: String(review.comment || "").slice(0, 4000),
    createdAt: review.createTime || new Date().toISOString(),
    updatedAt: review.updateTime || review.createTime || "",
    hasReply: Boolean(review.reviewReply && review.reviewReply.comment),
  }));
}

async function putReply(
  accessToken,
  connection,
  googleReviewId,
  comment,
  config,
  fetchImpl = fetch,
) {
  const response = await fetchImpl(
    `${config.endpoints.reviews}/${connection.accountName}/${connection.locationName}/reviews/${googleReviewId}/reply`,
    {
      method: "PUT",
      headers: { ...bearer(accessToken), "content-type": "application/json" },
      body: JSON.stringify({ comment }),
    },
  );
  return readJson(response, "Publishing the Google reply");
}

module.exports = {
  ENDPOINTS,
  readConfig,
  seal,
  open,
  authUrl,
  exchangeCode,
  refreshAccessToken,
  listAccounts,
  listLocations,
  listReviews,
  putReply,
  starValue,
};
