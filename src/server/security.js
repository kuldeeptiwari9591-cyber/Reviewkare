"use strict";
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);
const digest = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");
const random = () => crypto.randomBytes(32).toString("base64url");
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
function text(value, label, max = 200, required = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)
  )
    fail(400, `Invalid ${label}.`);
  const result = value.trim();
  if (required && !result) fail(400, `${label} is required.`);
  return result;
}
function email(value) {
  const result = text(value, "email", 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))
    fail(400, "Enter a valid email address.");
  return result;
}
function password(value) {
  if (typeof value !== "string" || value.length < 12 || value.length > 128)
    fail(400, "Use a password with 12 to 128 characters.");
  return value;
}
async function hashPassword(value) {
  const salt = crypto.randomBytes(16).toString("hex");
  return { salt, hash: (await scrypt(value, salt, 64)).toString("hex") };
}
async function verifyPassword(value, hash, salt) {
  if (typeof value !== "string" || value.length > 128) return false;
  const actual = await scrypt(value, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}
function cookies(req) {
  const result = Object.create(null);
  for (const part of (req.headers.cookie || "").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    try {
      result[part.slice(0, index).trim()] = decodeURIComponent(
        part.slice(index + 1).trim(),
      );
    } catch {
      /* Ignore invalid encodings; a bad cookie cannot crash a request. */
    }
  }
  return result;
}
function redirect(value) {
  return typeof value === "string" && /^\/app(?:\/[a-z0-9/-]*)?$/.test(value)
    ? value
    : "/app";
}
function readRawBody(req, limit = 32768) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size <= limit) chunks.push(chunk);
    });
    req.on("error", reject);
    req.on("end", () => {
      if (size > limit) {
        const error = new Error("Request body is too large.");
        error.status = 413;
        return reject(error);
      }
      resolve(Buffer.concat(chunks));
    });
  });
}
async function readBody(req) {
  const raw = await readRawBody(req);
  try {
    const result = JSON.parse(raw.toString() || "{}");
    if (!result || Array.isArray(result) || typeof result !== "object") throw new Error();
    return result;
  } catch {
    fail(400, "Send a valid JSON object.");
  }
}
function limiter(db) {
  if (db)
    return {
      async check(key, limit, duration = 60000) {
        const now = Date.now();
        const result = await db
          .prepare(
            `
        INSERT INTO rate_limits(bucket, window_end, count) VALUES(?,?,1)
        ON CONFLICT(bucket) DO UPDATE SET
          count = CASE WHEN rate_limits.window_end <= ? THEN 1 ELSE LEAST(rate_limits.count+1,?) END,
          window_end = CASE WHEN rate_limits.window_end <= ? THEN excluded.window_end ELSE rate_limits.window_end END
        RETURNING count
      `,
          )
          .get(digest(key), now + duration, now, limit + 1, now);
        if (result.count > limit)
          fail(429, "Too many requests. Please wait before trying again.");
      },
      close() {},
    };
  const records = new Map();
  const cleanup = setInterval(() => {
    for (const [key, r] of records)
      if (r.until < Date.now()) records.delete(key);
  }, 60000);
  cleanup.unref();
  return {
    check(key, limit, duration = 60000) {
      const now = Date.now();
      let record = records.get(key);
      if (!record || record.until <= now) {
        record = { count: 0, until: now + duration };
        records.set(key, record);
      }
      if (records.size > 20000) fail(503, "Please try again shortly.");
      if (++record.count > limit)
        fail(429, "Too many requests. Please wait before trying again.");
    },
    close: () => clearInterval(cleanup),
  };
}
module.exports = {
  digest,
  random,
  escape,
  fail,
  text,
  email,
  password,
  hashPassword,
  verifyPassword,
  cookies,
  redirect,
  readBody,
  readRawBody,
  limiter,
};
