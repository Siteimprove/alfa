import { packages } from "./helpers/meta";
import { writeFile } from "./helpers/file-system";
import * as notify from "./helpers/notify";

import { sync } from "./tasks/sync";

for (const pkg of packages) {
  const manifest = require(`../packages/${pkg}/package.json`);

  writeFile(`packages/${pkg}/package.json`, sync(manifest));

  notify.success(manifest.name);
}
