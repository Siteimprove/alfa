// @ts-check

const { spawn } = require("./child-process");

function git(command, options = []) {
  return spawn("git", [command, ...options]).stdout;
}

function stageFile(file) {
  return git("add", [file]);
}

function getStagedFiles() {
  return git("diff", ["--name-only", "--cached"]).split("\n");
}

module.exports = { git, stageFile, getStagedFiles };
