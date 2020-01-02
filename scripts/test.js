const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const notify = require("./helpers/notify");

let { packages } = require("./helpers/meta");

const { test } = require("./tasks/test");

if (process.argv.length > 2) {
  packages = process.argv
    .slice(2)
    .map(root => root.replace("packages/", ""))
    .filter(pkg => {
      return packages.includes(pkg);
    });
}

for (const pkg of packages) {
  const root = `packages/${pkg}/test`;
  const files = findFiles(root, endsWith(".spec.ts", ".spec.tsx"));

  for (const file of files) {
    if (test(file)) {
      notify.success(file);
    } else {
      process.exit(1);
    }
  }
}
