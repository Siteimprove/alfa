const { default: chalk } = require("chalk");

const git = require("./helpers/git");
const notify = require("./helpers/notify");

const { format } = require("./tasks/format");

for (const file of git.getStagedFiles()) {
  if (format(file)) {
    notify.success(file);
  } else {
    notify.skip(chalk.gray(file));
  }
}
