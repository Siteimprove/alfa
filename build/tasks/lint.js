import * as prettier from "prettier";
import chalk from "chalk";

import { readFile, writeFile } from "../helpers/file-system";
import { stageFile, isStaged } from "../helpers/git";
import * as notify from "../helpers/notify";

/**
 * @param {string} file
 * @return {boolean}
 */
export function lint(file) {
  const code = readFile(file);

  let formatted;
  try {
    formatted = prettier.format(code, { filepath: file });
  } catch (err) {}

  if (formatted !== undefined && formatted !== code) {
    writeFile(file, formatted);

    if (isStaged(file)) {
      stageFile(file);
    }

    return true;
  }

  notify.skip(chalk.dim(file));

  return false;
}
