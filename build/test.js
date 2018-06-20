import { findFiles } from "./helpers/file-system";
import { endsWith } from "./helpers/predicates";
import { packages } from "./helpers/meta";
import * as notify from "./helpers/notify";

import { test } from "./tasks/test";

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
