"use strict";

const milestones = Object.freeze({
  workspace_ready: "Business details and QR are ready.",
  qr_printed: "You opened the printable QR poster.",
  first_scan: "Your QR received its first scan.",
  first_review: "Your workspace recorded its first review.",
  first_reply: "Your first reply was published.",
  replies_10: "You published 10 replies.",
  replies_50: "You published 50 replies.",
  replies_100: "You published 100 replies.",
  reviews_25: "Your workspace recorded 25 reviews.",
  reviews_100: "Your workspace recorded 100 reviews.",
});
const quiet = new Set(["workspace_ready", "reviews_25", "reviews_100"]);

function createMilestones(db) {
  return {
    mark: (id, event) => db.prepare(
      "INSERT INTO milestones(tenant_id,event,seen) VALUES(?,?,?) ON CONFLICT(tenant_id,event) DO NOTHING",
    ).run(id, event, Number(quiet.has(event) || event === "google_skipped" || event === "google_connected")),
    list: (id) => db.prepare("SELECT event,seen FROM milestones WHERE tenant_id=? ORDER BY reached_at,event").all(id),
    async notifications(id) {
      const rows = await db.prepare(
        "UPDATE milestones SET seen=1 WHERE tenant_id=? AND seen=0 RETURNING event",
      ).all(id);
      return rows.map(row => milestones[row.event]).filter(Boolean);
    },
  };
}

module.exports = { createMilestones, milestones };
