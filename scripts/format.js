const chalk = require("chalk");

const { findFiles } = require("./helpers/file-system");
const notify = require("./helpers/notify");

const { format } = require("./tasks/format");

notify.pending("Checking if files are correctly formatted");

for (const file of findFiles(".")) {
  if (format(file)) {
    notify.error(`${chalk.gray(file)} File has not been formatted`);

    if (process.env.CI === "true") {
      process.exit(1);
    }
  }
}
