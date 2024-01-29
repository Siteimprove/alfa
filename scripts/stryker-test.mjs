import async from "async";
import { execaNode } from "execa";
import os from "os";

import { system } from "./common/system.mjs";

/**
 * @param {string} fileName the test file to run
 * @returns {Promise<boolean>} true if any test in the file fails
 */
async function test(fileName) {
  const childProcessResult = await execaNode(fileName, [], {
    nodeOptions: [...process.execArgv],
    stdio: "inherit",
  });

  return childProcessResult.exitCode === 1;
}

/**
 * Runs the tests in parallel and exits with code 1 as soon as one test fails.
 * @returns {Promise<void>} a promise that resolves when one test fails or all tests pass
 */
async function main() {
  const testFiles = system.readDirectory(
    "packages",
    [".spec.js"],
    ["node_modules"],
  );

  const limit = os.cpus().length;

  async.someLimit(testFiles, limit, test, (err, result) => {
    if (err) {
      throw err;
    }

    if (result) {
      system.exit(1);
    }
  });
}

main();
