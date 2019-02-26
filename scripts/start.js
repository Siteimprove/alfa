const { watchFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { format, now } = require("./helpers/time");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { diagnose } = require("./tasks/diagnose");
const { test } = require("./tasks/test");

const isSpec = endsWith(".spec.ts", ".spec.tsx");

watchFiles(
  [
    "packages/**/*.ts",
    "packages/**/*.tsx",
    "packages/**/scripts/**/*.js",
    "scripts/**/*.js",
    "docs/**/*.ts",
    "docs/**/*.tsx"
  ],
  (event, file) => {
    const start = now();

    let success = diagnose(file) && build(file);

    if (isSpec(file)) {
      success = success && test(file);
    }

    const duration = now(start);

    if (success) {
      notify.success(
        `${file} ${format(duration, { color: "yellow", threshold: 400 })}`
      );
    }
  }
);

notify.watch("Watching files for changes");
