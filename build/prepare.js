import { findFiles } from "./helpers/file-system";
import { endsWith, not } from "./helpers/predicates";
import { packages } from "./helpers/meta";
import * as notify from "./helpers/notify";

import { build } from "./tasks/build";
import { clean } from "./tasks/clean";

const files = findFiles("build", endsWith(".js"));

for (const pkg of packages) {
  clean(`packages/${pkg}`);

  files.push(
    ...findFiles(`packages/${pkg}`, endsWith(".ts", ".tsx")).filter(
      not(endsWith(".spec.ts", ".spec.tsx"))
    )
  );
}

files.push(...findFiles("docs", endsWith(".ts", ".tsx")));

for (const file of files) {
  if (build(file)) {
    notify.success(file);
  } else {
    process.exit(1);
  }
}
