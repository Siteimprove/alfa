const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
let { packages } = require("./helpers/meta");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { test } = require("./tasks/test");

if (process.argv.length > 2) {
  packages = process.argv.slice(2);
}

for (const pkg of packages) {
  const root = `packages/${pkg.replace("packages/", "")}/test`;
  const files = findFiles(root, endsWith(".spec.ts", ".spec.tsx"));

  for (const file of files) {
    if (build(file) && test(file)) {
      notify.success(file);
    } else {
      process.exit(1);
    }
  }
}
