import chalk from "chalk";

import { withExtension } from "../helpers/path";
import { fork } from "../helpers/child-process";
import * as notify from "../helpers/notify";

import { build } from "./build";

/**
 * @param {string} file
 * @return {boolean}
 */
export function test(file) {
  if (build(file)) {
    const child = fork(withExtension(file, ".js"), [], {
      stdio: "inherit",
      execArgv: [
        ...process.execArgv,
        "--require",
        require.resolve("../helpers/coverage")
      ]
    });

    if (child.status === 0) {
      return true;
    }

    notify.error(chalk.gray(file));
  }

  return false;
}
