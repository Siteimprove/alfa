const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const notify = require("./helpers/notify");

const { test } = require("./tasks/test");

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
