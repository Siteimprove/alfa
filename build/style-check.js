const prettier = require("prettier");
const { default: chalk } = require("chalk");

const { findFiles, readFile } = require("./helpers/file-system");
const notify = require("./helpers/notify");

const offences = findFiles(".", file => {
  if (
    file.substring(file.length - 3, file.length) !== ".ts" ||
    file.substring(file.length - 5, file.length) === ".d.ts"
  ) {
    return false;
  }

  const code = readFile(file);
  let formatted;

  try {
    formatted = prettier.format(code, { filepath: file });
  } catch (e) {
    return false;
  }

  if (formatted === undefined || formatted === code) {
    return false;
  }

  notify.error(chalk.gray(`${file}: File is not formatted properly.`));
  return true;
});

if (offences.length > 0) {
  process.exitCode = 1;
}
