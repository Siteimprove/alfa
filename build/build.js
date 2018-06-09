// @ts-check

const path = require("path");
const chalk = require("chalk");

const { findFiles } = require("./helpers/file-system");
const { notify } = require("./helpers/notify");
const { endsWith } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");

const { build } = require("./tasks/build");

for (const pkg of packages) {
  const root = `packages/${pkg}`;
  const files = findFiles(root, endsWith(".ts", ".tsx"));

  for (const file of files) {
    if (build(file)) {
      notify.success(chalk.dim(file));
    } else {
      process.exit(1);
    }
  }
}
