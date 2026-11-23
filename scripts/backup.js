"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync: Database, backup } = require("node:sqlite");
async function main() {
  if (!process.env.DATA_DIR || !process.env.BACKUP_DIR)
    throw new Error(
      "Set DATA_DIR and BACKUP_DIR explicitly. Copy backups off the service disk separately.",
    );
  const destination = path.resolve(process.env.BACKUP_DIR);
  fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
  const db = new Database(
    path.join(process.env.DATA_DIR, "reviewkare.sqlite"),
    { readOnly: true },
  );
  const file = path.join(
    destination,
    "reviewkare-" + new Date().toISOString().replaceAll(":", "-") + ".sqlite",
  );
  await backup(db, file);
  db.close();
  const restored = new Database(file);
  if (restored.prepare("PRAGMA integrity_check").get().integrity_check !== "ok")
    throw new Error("Backup integrity verification failed.");
  // Collapse any WAL sidecars so the off-service artifact is one file.
  restored.exec("PRAGMA journal_mode = DELETE");
  restored.close();
  try {
    fs.chmodSync(file, 0o600);
  } catch (error) {
    if (process.platform !== "win32") throw error;
  }
  console.log(JSON.stringify({ event: "backup_verified", file }));
}
main().catch(() => {
  console.error("Backup failed. Verify the configured paths and permissions.");
  process.exitCode = 1;
});
