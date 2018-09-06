const { default: chalk } = require("chalk");
const { findFiles } = require("./helpers/file-system");
const fs = require("fs");
const { endsWith } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const path = require("path");
const notify = require("./helpers/notify");

const { test } = require("./tasks/test");

for (const pkg of packages) {
  const root = `packages/${pkg}/`;
  const files = findFiles(root, endsWith(".ts", ".tsx"));

  for (const file of files) {
    if (file.endsWith(".spec.ts") || file.endsWith(".spec.tsx")) {
      if (test(file)) {
        notify.success(file);
        continue;
      }

      process.exit(1);
    }

    if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
      const dir = path
        .dirname(file)
        .split(path.sep)
        .map(part => (part === "src" ? "test" : part))
        .join(path.sep);
      const testFile = path.join(dir, `${path.basename(file, ".ts")}.spec.js`);

      if (!fs.existsSync(testFile)) {
        notify.warn(`${chalk.dim(file)} Low coverage (0.00%)`);
      }
    }
  }
}
