"use strict";
const path = require("node:path");
const Database = require("better-sqlite3");
if (!process.env.DATA_DIR) throw new Error("Set DATA_DIR explicitly.");
const db = new Database(
  path.join(process.env.DATA_DIR, "reviewkare.sqlite"),
  { readonly: true },
);
if (process.argv.includes("--details")) {
  // Operator-only command. Do not send this output to public/shared logs.
  console.log(
    JSON.stringify(
      db
        .prepare(
          "SELECT id,kind,tenant_id,document,created FROM requests ORDER BY created DESC LIMIT 100",
        )
        .all(),
      null,
      2,
    ),
  );
} else
  console.log(
    JSON.stringify(
      db
        .prepare("SELECT kind,count(*) AS count FROM requests GROUP BY kind")
        .all(),
    ),
  );
db.close();
