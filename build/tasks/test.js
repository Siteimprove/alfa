import chalk from "chalk";

import { withExtension } from "../helpers/path";
import { spawn } from "../helpers/child-process";
import * as notify from "../helpers/notify";

import { build } from "./build";

/**
 * @param {string} file
 * @return {boolean}
 */
export function test(file) {
  if (build(file)) {
    const child = spawn("node", ["-r", "esm", withExtension(file, ".js")], {
      stdio: "inherit"
    });

    if (child.status === 0) {
      return true;
    }

    notify.error(chalk.dim(file));
  }

  return false;
}
