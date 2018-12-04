const { watchFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { format, now } = require("./helpers/time");
const notify = require("./helpers/notify");
const { specFileCheck } = require("./helpers/qa-computing");
const { createTypeScriptSource } = require("./helpers/compile-ts-source");
const { readFile } = require("./helpers/file-system");

const { build } = require("./tasks/build");
const { test } = require("./tasks/test");

const isSpec = endsWith(".spec.ts", ".spec.tsx");
const isSrc = endsWith(".ts", ".tsx");
const isBuild = endsWith(".js");

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
    let success;

    const start = now();

    switch (true) {
      case isSpec(file):
        success = test(file);
        break;
      case isSrc(file):
      case isBuild(file):
        specFileCheck(file, createTypeScriptSource(readFile(file)));
        success = build(file);
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
