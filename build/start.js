import { watchFiles } from "./helpers/file-system";
import { endsWith } from "./helpers/predicates";
import * as notify from "./helpers/notify";

import { build } from "./tasks/build";
import { test } from "./tasks/test";

const isSpec = endsWith(".spec.ts", ".spec.tsx");
const isSrc = endsWith(".ts", ".tsx");
const isBuild = endsWith(".js");

watchFiles(
  [
    "packages/**/*.ts",
    "packages/**/*.tsx",
    "build/**/*.js",
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
