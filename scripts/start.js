const { watchFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { test } = require("./tasks/test");

const isSpec = endsWith(".spec.ts", ".spec.tsx");
const isSrc = endsWith(".ts", ".tsx");
const isBuild = endsWith(".js");

watchFiles(
  [
    "packages/**/*.ts",
    "packages/**/*.tsx",
    "scripts/**/*.js",
    "docs/**/*.ts",
    "docs/**/*.tsx"
  ],
  (event, file) => {
    let success;

    switch (true) {
      case isSpec(file):
        success = test(file);
        break;
      case isSrc(file):
      case isBuild(file):
        success = build(file);
    }

    if (success) {
      notify.success(file);
    }
  }
);

notify.watch("Watching files for changes");
