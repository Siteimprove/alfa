// @ts-check

const chalk = require("chalk");

const git = require("./helpers/git");
const { notify } = require("./helpers/notify");

const { lint } = require("./tasks/lint");

for (const file of git.getStagedFiles()) {
  if (lint(file)) {
    notify.success(chalk.dim(file));
  }
}
