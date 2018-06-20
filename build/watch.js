import { watchFiles } from "./helpers/file-system";
import { endsWith } from "./helpers/predicates";
import * as notify from "./helpers/notify";

import { build } from "./tasks/build";
import { test } from "./tasks/test";

const isSpec = endsWith(".spec.ts", ".spec.tsx");
const isSrc = endsWith(".ts", ".tsx");

watchFiles("packages", (event, file) => {
  let success;

  if (isSpec(file)) {
    success = test(file);
  } else if (isSrc(file)) {
    success = build(file);
  }

  if (success) {
    notify.success(file);
  }
});

notify.watch("Watching files for changes");
