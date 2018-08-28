const { default: chalk } = require("chalk");
const prettier = require("prettier");
const notify = require("../helpers/notify");

const { readFile, writeFile } = require("../helpers/file-system");
const { stageFile, isStaged } = require("../helpers/git");

/**
 * @param {string} file
 * @return {boolean}
 */
function format(file) {
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

  if (process.env.CI !== "true") {
    notify.skip(chalk.gray(file));
  }

  return false;
}

exports.format = format;
