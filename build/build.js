import { findFiles } from "./helpers/file-system";
import { endsWith } from "./helpers/predicates";
import { packages } from "./helpers/meta";
import * as notify from "./helpers/notify";

import { build } from "./tasks/build";

const isSpec = endsWith(".spec.ts", ".spec.tsx");

for (const pkg of packages) {
  const root = `packages/${pkg}`;
  const files = findFiles(root, endsWith(".ts", ".tsx"));

  for (const file of files) {
    if (isSpec(file)) {
      continue;
    }

    if (build(file)) {
      notify.success(file);
    } else {
      process.exit(1);
    }
  }
}
