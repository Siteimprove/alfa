// @ts-check

const prettier = require("prettier");
const chalk = require("chalk");

const { readFile, writeFile } = require("../helpers/file-system");
const { stageFile, isStaged } = require("../helpers/git");
const { notify } = require("../helpers/notify");

/**
 * @param {string} file
 * @return {boolean}
 */
function lint(file) {
  const code = readFile(file);

  let formatted;
  try {
    formatted = prettier.format(code, { filepath: file });
  } catch {}

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

module.exports = { lint };
