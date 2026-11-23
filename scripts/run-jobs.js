"use strict";
const { createApplication } = require("../src/server/application");
const { openPostgres } = require("../src/server/postgres");

async function main() {
  const storage = process.env.DATABASE_URL ? await openPostgres(process.env.DATABASE_URL) : undefined;
  let app;
  try {
    app = createApplication({ storage });
    const result = await app.runJobs();
    console.log(JSON.stringify(result));
    if (result.failed) process.exitCode = 1;
  } finally {
    await (app ? app.close() : storage?.close());
  }
}
main().catch(() => {
  console.error("Job runner failed. Check storage and provider configuration.");
  process.exitCode = 1;
});
