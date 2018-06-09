// @ts-check

const path = require("path");
const chalk = require("chalk");

const { findFiles } = require("./helpers/file-system");
const { notify } = require("./helpers/notify");
const { endsWith } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");

const typescript = require("./tasks/typescript");

for (const pkg of packages) {
  const root = `packages/${pkg}`;
  const files = findFiles(root, endsWith(".ts", ".tsx"));

  for (const file of files) {
    if (typescript.compile(file)) {
      notify.success(chalk.dim(path.relative(process.cwd(), file)));
    } else {
      process.exit(1);
    }
  }
}
