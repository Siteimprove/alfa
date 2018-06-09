// @ts-check

const path = require("path");
const chalk = require("chalk");

const { findFiles } = require("./helpers/file-system");
const { withExtension } = require("./helpers/path");
const { notify } = require("./helpers/notify");
const { endsWith } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const { spawn } = require("./helpers/child-process");

const typescript = require("./tasks/typescript");

for (const pkg of packages) {
  const root = `packages/${pkg}/test`;
  const files = findFiles(root, endsWith(".spec.ts", ".spec.tsx"));

  for (const file of files) {
    if (typescript.compile(file)) {
      const child = spawn("node", [withExtension(file, ".js")], {
        stdio: "inherit"
      });

      if (child.status === 0) {
        notify.success(chalk.dim(path.relative(process.cwd(), file)));
      } else {
        notify.error(chalk.dim(path.relative(process.cwd(), file)));
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
}
