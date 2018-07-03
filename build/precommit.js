import * as git from "./helpers/git";
import * as notify from "./helpers/notify";

import { format } from "./tasks/format";

for (const file of git.getStagedFiles()) {
  if (format(file)) {
    notify.success(file);
  }
}
