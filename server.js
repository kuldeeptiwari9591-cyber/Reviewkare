"use strict";
require("./src/server/application")
  .start()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
