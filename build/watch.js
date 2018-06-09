// @ts-check

const chalk = require("chalk");

const { watchFiles } = require("./helpers/file-system");
const { notify } = require("./helpers/notify");
const { endsWith } = require("./helpers/predicates");

const { build } = require("./tasks/build");
const { test } = require("./tasks/test");

const isSpec = endsWith(".spec.ts", ".spec.tsx");

watchFiles("packages", (event, file) => {
  let success;

  if (isSpec(file)) {
    success = test(file);
  } else {
    success = build(file);
  }

  if (success) {
    notify.success(chalk.dim(file));
  }
});

notify.watch("Watching files for changes");
