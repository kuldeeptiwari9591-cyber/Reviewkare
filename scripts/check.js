"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const files = ["server.js", "public/app.js", "public/scene.js"];
for (const dir of ["src/server", "src/server/views", "scripts", "tests"])
  for (const file of fs.readdirSync(dir))
    if (file.endsWith(".js")) files.push(path.join(dir, file));
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(1);
  }
}
for (const file of [
  "app.css",
  "app.js",
  "scene.js",
  "favicon.svg",
  "og-banner.png",
  "logo.png",
  "fonts/space-grotesk-latin.woff2",
])
  if (!fs.statSync(path.join("public", file)).isFile())
    throw new Error("Missing public asset: " + file);
require("qrcode");
if (!fs.statSync(path.join("node_modules", "web-vitals", "dist", "web-vitals.iife.js")).isFile())
  throw new Error("Missing Core Web Vitals browser bundle.");
const forbidden = [
  [/\bdemo=true\b|\badmin@reviewkare\.tech\b/i, "legacy demo access"],
  [/\bofficial google\b|\bgoogle (?:verified )?partner\b/i, "unsupported affiliation"],
  [/\bzero[- ]phi\b|\b100%\s+(?:\w+\s+){0,3}compliant\b/i, "unsupported compliance claim"],
  [/\ball systems operational\b/i, "static uptime claim"],
  [/\b(?:free trial|14-day trial|gstin|input tax credit|tax invoice)\b/i, "unsupported commercial copy"],
];
for (const dir of ["public", "src/server"]) {
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.(?:js|html|css|json|svg|txt|map)$/i.test(entry.name)) continue;
    const file = path.join(entry.parentPath, entry.name);
    const source = fs.readFileSync(file, "utf8");
    if (dir === "public" && /SUPABASE_SERVICE_ROLE_KEY/.test(source))
      throw new Error(`Server-only Supabase credential reference in ${file}`);
    for (const [pattern, reason] of forbidden) {
      if (pattern.test(source)) throw new Error(`${reason} in ${file}`);
    }
  }
}
console.log(
  `Validated ${files.length} active JavaScript files and required assets. No TypeScript/dist runtime is used.`,
);
