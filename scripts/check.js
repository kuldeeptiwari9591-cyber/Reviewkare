"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const files = ["server.js", "public/app.js", "public/scene.js"];
for (const dir of ["src/server", "scripts", "tests"])
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
console.log(
  `Validated ${files.length} active JavaScript files and required assets. No TypeScript/dist runtime is used.`,
);
