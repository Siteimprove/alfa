// @ts-check

const { spawn } = require("./child-process");

/**
 * @param {string} command
 * @param {Array<string>} [options]
 * @return {string}
 */
function git(command, options = []) {
  return spawn("git", [command, ...options]).stdout;
}

/**
 * @param {string} file
 */
function stageFile(file) {
  git("add", [file]);
}

/**
 * @return {Array<string>}
 */
function getStagedFiles() {
  const diff = git("diff", ["--name-only", "--cached"]);

  if (diff === "") {
    return [];
  }

  return diff.split("\n");
}

/**
 * @param {string} file
 * @return {boolean}
 */
function isStaged(file) {
  return getStagedFiles().indexOf(file) !== -1;
}

/**
 * @param {string} file
 * @return {boolean}
 */
function isIgnored(file) {
  return git("check-ignore", [file]) === file;
}

module.exports = { git, stageFile, getStagedFiles, isStaged, isIgnored };
