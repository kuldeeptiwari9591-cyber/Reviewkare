"use strict";
// Explicit, offline migration. Legacy payment status and sessions are never trusted.
const fs = require("node:fs");
const path = require("node:path");
const S = require("../src/server/security");
const { openStorage } = require("../src/server/storage");
async function main() {
  if (!process.env.LEGACY_DATA_DIR || !process.env.DATA_DIR)
    throw new Error("Set separate LEGACY_DATA_DIR and DATA_DIR paths.");
  const source = path.resolve(process.env.LEGACY_DATA_DIR),
    destination = path.resolve(process.env.DATA_DIR);
  if (source === destination)
    throw new Error("Source and destination must differ.");
  const registry = JSON.parse(
    fs.readFileSync(path.join(source, "registry.json"), "utf8"),
  );
  const users = Object.entries(registry.users || {});
  const prepared = [];
  for (const [rawEmail, user] of users) {
    const email = S.email(rawEmail);
    if (user.tenantId === "default" || email === "dr.sharma@sharmadental.in")
      continue;
    if (!/^t_[a-zA-Z0-9_-]+$/.test(user.tenantId))
      throw new Error("Invalid legacy tenant ID.");
    const file = path.resolve(source, "tenants", user.tenantId + ".json");
    if (!file.startsWith(path.join(source, "tenants") + path.sep))
      throw new Error("Invalid source path.");
    const old = JSON.parse(fs.readFileSync(file, "utf8"));
    const store = {
      id: user.tenantId,
      location: {
        id: user.tenantId,
        name: S.text(
          old.location?.name || "Imported business",
          "business name",
          120,
          true,
        ),
        city: S.text(old.location?.city || "", "city", 100),
        placeId: "",
        vertical: "business",
      },
      user: {
        email,
        name: S.text(old.user?.name || "Owner", "owner name", 100, true),
        role: "owner",
      },
      plan: {
        tier: "basic",
        name: "Imported account — access pending review",
        status: "migration-review",
        expiresAt: new Date(0).toISOString(),
      },
      qr: { code: S.random(), scans: 0, drafts: 0 },
      staff: [],
      receipts: [],
      usage: {
        month: new Date().toISOString().slice(0, 7),
        replies: 0,
        drafts: 0,
      },
      createdAt: new Date().toISOString(),
    };
    const reviewRows = [];
    for (const item of (old.reviews || []).slice(0, 1000)) {
      const rating = Number(item.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) continue;
      reviewRows.push({
        id: S.random(),
        locationId: store.id,
        reviewerName: S.text(
          item.reviewerName || "Reviewer",
          "reviewer name",
          100,
          true,
        ),
        rating,
        text: S.text(item.text || "", "review text", 4000),
        source: "legacy-import-unverified",
        createdAt: new Date().toISOString(),
        reply: {
          draftText: S.text(
            item.reply?.finalText ||
              item.reply?.draftText ||
              "Thank you for sharing your feedback.",
            "reply",
            2000,
            true,
          ),
          status: "draft",
          model: "legacy-import",
          validatorPassed: false,
          isAutoPosted: false,
        },
      });
    }
    prepared.push({ email, store, reviews: reviewRows });
  }
  if (!process.argv.includes("--apply")) {
    console.log(
      JSON.stringify({
        mode: "dry-run",
        accounts: prepared.length,
        message:
          "No database changes. Default/demo data, sessions, and alleged payments are excluded. --apply imports accounts requiring password recovery and destination/access review.",
      }),
    );
    return;
  }
  const storage = openStorage(destination);
  try {
    for (const item of prepared) {
      // Do not retain potentially weak or publicly exposed legacy credentials.
      const hp = await S.hashPassword(S.random() + S.random());
      await storage.transaction(async () => {
        if (
          storage.rawDb
            .prepare("SELECT 1 FROM tenants WHERE id=?")
            .get(item.store.id) ||
          storage.rawDb
            .prepare("SELECT 1 FROM users WHERE email=?")
            .get(item.email)
        )
          throw new Error(
            "Existing account would be overwritten. Migration stopped.",
          );
        storage.rawDb
          .prepare("INSERT INTO tenants(id,document) VALUES(?,?)")
          .run(item.store.id, JSON.stringify(item.store));
        for (const review of item.reviews)
          await storage.reviews.create(item.store.id, review);
        storage.rawDb
          .prepare(
            "INSERT INTO users(email,tenant_id,hash,salt) VALUES(?,?,?,?)",
          )
          .run(item.email, item.store.id, hp.hash, hp.salt);
        await storage.event(item.store.id, "legacy_import_requires_review");
      });
    }
    console.log(
      JSON.stringify({
        mode: "applied",
        accounts: prepared.length,
        message:
          "Configure email recovery. Review each entitlement and Google destination before granting access. Old printed QR codes are not reused.",
      }),
    );
  } finally {
    await storage.close();
  }
}
main().catch(() => {
  console.error(
    "Migration stopped. Validate source files, tenant records, and destination conflicts privately. Back up both datasets before retrying.",
  );
  process.exitCode = 1;
});
