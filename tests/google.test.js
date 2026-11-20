"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const G = require("../src/server/google");

const KEY = crypto.randomBytes(32).toString("base64");

function config(overrides = {}) {
  return {
    enabled: true,
    configured: true,
    missing: [],
    clientId: "client-fixture.apps.googleusercontent.com",
    clientSecret: "fixture-secret",
    redirectUri: "https://reviewkare.test/api/google/callback",
    encryptionKey: KEY,
    scope: G.ENDPOINTS.scope,
    endpoints: G.ENDPOINTS,
    ...overrides,
  };
}

function respond(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    text: async () =>
      payload === undefined
        ? ""
        : typeof payload === "string"
          ? payload
          : JSON.stringify(payload),
  };
}

test("configuration reports every missing credential without leaking values", () => {
  const read = G.readConfig({});
  assert.equal(read.enabled, false);
  assert.equal(read.configured, false);
  assert.deepEqual(read.missing, [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "TOKEN_ENCRYPTION_KEY",
  ]);

  const full = G.readConfig({
    GOOGLE_BUSINESS_ENABLED: "true",
    GOOGLE_CLIENT_ID: "id",
    GOOGLE_CLIENT_SECRET: "secret",
    GOOGLE_REDIRECT_URI: "https://example.test/cb",
    TOKEN_ENCRYPTION_KEY: KEY,
  });
  assert.equal(full.enabled, true);
  assert.equal(full.configured, true);
  assert.deepEqual(full.missing, []);
  assert.equal(full.scope, G.ENDPOINTS.scope);
});

test("refresh tokens are sealed with AES-256-GCM and never stored in plaintext", () => {
  const cfg = config();
  const sealed = G.seal("refresh-token-value", cfg);
  assert.ok(sealed.startsWith("v1."));
  assert.equal(sealed.split(".").length, 4);
  assert.ok(!sealed.includes("refresh-token-value"));
  assert.equal(G.open(sealed, cfg), "refresh-token-value");
  // Sealing twice produces different ciphertext for the same plaintext.
  assert.notEqual(G.seal("refresh-token-value", cfg), sealed);
});

test("sealed tokens fail closed when tampered with or decrypted with another key", () => {
  const cfg = config();
  const sealed = G.seal("refresh-token-value", cfg);
  const parts = sealed.split(".");
  const tag = parts[2];
  const flipped = (tag[0] === "A" ? "B" : "A") + tag.slice(1);
  const tampered = [parts[0], parts[1], flipped, parts[3]].join(".");
  assert.throws(() => G.open(tampered, cfg));
  assert.throws(() => G.open("plain-text", cfg));
  assert.throws(() => G.open(sealed, config({ encryptionKey: crypto.randomBytes(32).toString("base64") })));
  assert.throws(() => G.seal("x", config({ encryptionKey: "too-short" })));
});

test("the OAuth URL carries the offline scope, redirect, and state", () => {
  const url = new URL(G.authUrl("state-fixture", config()));
  assert.equal(url.origin + url.pathname, G.ENDPOINTS.authUrl);
  assert.equal(url.searchParams.get("client_id"), "client-fixture.apps.googleusercontent.com");
  assert.equal(url.searchParams.get("redirect_uri"), "https://reviewkare.test/api/google/callback");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("scope"), G.ENDPOINTS.scope);
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(url.searchParams.get("prompt"), "consent");
  assert.equal(url.searchParams.get("state"), "state-fixture");
});

test("star ratings map from Google enums and numeric values", () => {
  assert.equal(G.starValue("FIVE"), 5);
  assert.equal(G.starValue("one"), 1);
  assert.equal(G.starValue("THREE"), 3);
  assert.equal(G.starValue("STAR_RATING_UNSPECIFIED"), 0);
  assert.equal(G.starValue(undefined), 0);
  assert.equal(G.starValue(0), 1);
  assert.equal(G.starValue(9), 5);
  assert.equal(G.starValue(4), 4);
});

test("code exchange and refresh use the token endpoint and never hardcode secrets", async () => {
  const calls = [];
  const fakeFetch = async (url, options) => {
    calls.push({ url, options });
    return respond({
      access_token: "access-1",
      refresh_token: "refresh-1",
      expires_in: 3599,
      scope: "business.manage",
    });
  };
  const cfg = config();
  const result = await G.exchangeCode("auth-code", cfg, fakeFetch);
  assert.equal(result.accessToken, "access-1");
  assert.equal(result.refreshToken, "refresh-1");
  assert.equal(result.expiresIn, 3599);
  assert.equal(calls[0].url, G.ENDPOINTS.tokenUrl);
  assert.equal(calls[0].options.method, "POST");
  const body = new URLSearchParams(calls[0].options.body);
  assert.equal(body.get("code"), "auth-code");
  assert.equal(body.get("grant_type"), "authorization_code");
  assert.equal(body.get("client_secret"), "fixture-secret");
  assert.equal(body.get("redirect_uri"), "https://reviewkare.test/api/google/callback");

  const refreshed = await G.refreshAccessToken("refresh-1", cfg, fakeFetch);
  assert.equal(refreshed.accessToken, "access-1");
  assert.equal(new URLSearchParams(calls[1].options.body).get("grant_type"), "refresh_token");
  assert.equal(new URLSearchParams(calls[1].options.body).get("refresh_token"), "refresh-1");
});

test("accounts, locations, reviews, and replies hit the documented endpoints", async () => {
  const seen = [];
  const fakeFetch = async (url, options = {}) => {
    seen.push({ url, options });
    if (url.includes("/accounts?"))
      return respond({
        accounts: [{ name: "accounts/123", accountName: "Acme Group", type: "PERSONAL" }],
      });
    if (url.includes("/locations?"))
      return respond({
        locations: [{ name: "locations/456", title: "Northside Dental Studio" }],
      });
    if (url.includes("/reviews?"))
      return respond({
        reviews: [
          {
            reviewId: "rev-1",
            reviewer: { displayName: "Patient A" },
            starRating: "TWO",
            comment: "Waited too long.",
            createTime: "2026-01-02T03:04:05Z",
            updateTime: "2026-01-03T03:04:05Z",
          },
          {
            reviewId: "rev-2",
            reviewer: { displayName: "Patient B" },
            starRating: "FIVE",
            comment: "Great care.",
            createTime: "2026-01-04T03:04:05Z",
            reviewReply: { comment: "Thank you!" },
          },
        ],
      });
    return respond({ comment: "Thank you for the feedback." });
  };
  const cfg = config();
  const connection = {
    accountName: "accounts/123",
    locationName: "locations/456",
  };

  const accounts = await G.listAccounts("access-1", cfg, fakeFetch);
  assert.deepEqual(accounts, [
    { name: "accounts/123", label: "Acme Group", type: "PERSONAL" },
  ]);
  assert.equal(seen[0].options.headers.authorization, "Bearer access-1");

  const locations = await G.listLocations("access-1", "accounts/123", cfg, fakeFetch);
  assert.deepEqual(locations, [
    { name: "locations/456", title: "Northside Dental Studio" },
  ]);
  assert.ok(seen[1].url.includes("locations?readMask="));

  const reviews = await G.listReviews("access-1", connection, cfg, fakeFetch);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews[0], {
    googleReviewId: "rev-1",
    reviewerName: "Patient A",
    rating: 2,
    text: "Waited too long.",
    createdAt: "2026-01-02T03:04:05Z",
    updatedAt: "2026-01-03T03:04:05Z",
    hasReply: false,
  });
  assert.equal(reviews[1].hasReply, true);
  assert.equal(seen[2].url.includes("/accounts/123/locations/456/reviews"), true);

  const published = await G.putReply(
    "access-1",
    connection,
    "rev-1",
    "Thank you for the feedback.",
    cfg,
    fakeFetch,
  );
  assert.equal(published.comment, "Thank you for the feedback.");
  assert.equal(seen[3].options.method, "PUT");
  assert.ok(seen[3].url.endsWith("/reviews/rev-1/reply"));
  assert.deepEqual(JSON.parse(seen[3].options.body), {
    comment: "Thank you for the feedback.",
  });
});

test("Google API failures surface status and message without inventing success", async () => {
  const failing = async () =>
    respond({ error: { message: "Insufficient permission" } }, 403);
  await assert.rejects(
    () => G.listReviews("access-1", { accountName: "a", locationName: "b" }, config(), failing),
    (error) => {
      assert.equal(error.status, 403);
      assert.match(error.message, /Fetching Google reviews failed \(403\)/);
      assert.match(error.message, /Insufficient permission/);
      return true;
    },
  );
  await assert.rejects(
    () =>
      G.putReply("access-1", { accountName: "a", locationName: "b" }, "r", "x", config(), failing),
    (error) => {
      assert.equal(error.status, 403);
      assert.match(error.message, /Publishing the Google reply failed \(403\)/);
      return true;
    },
  );
  const html = async () => respond("<html>bad gateway</html>", 502);
  await assert.rejects(() => G.listAccounts("access-1", config(), html), /bad gateway/);
});
