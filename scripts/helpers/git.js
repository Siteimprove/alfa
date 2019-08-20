const fs = require("fs");
const { default: ignore } = require("ignore");
const { spawn } = require("./child-process");

/**
 * @param {string} command
 * @param {Array<string>} [options]
 * @return {string}
 */
function git(command, options = []) {
  return spawn("git", [command, ...options]).stdout;
}

exports.git = git;

/**
 * @param {string} file
 */
function stageFile(file) {
  git("add", [file]);
}

exports.stageFile = stageFile;

/**
 * @return {Array<string>}
 */
function getStagedFiles() {
  const diff = git("diff", ["--name-only", "--cached", "--diff-filter", "d"]);

  if (diff === "") {
    return [];
  }

  return diff.split("\n");
}

exports.getStagedFiles = getStagedFiles;

/**
 * @param {string} file
 * @return {boolean}
 */
function isStaged(file) {
  return getStagedFiles().indexOf(file) !== -1;
}

exports.isStaged = isStaged;

const gitignore = ignore().add(
  fs.readFileSync(require.resolve("../../.gitignore"), "utf8")
);

/**
 * @param {string} file
 * @return {boolean}
 */
function isIgnored(file) {
  return gitignore.ignores(file);
}

exports.isIgnored = isIgnored;
