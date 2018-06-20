// @ts-check

import * as git from "./helpers/git";
import * as notify from "./helpers/notify";

import { lint } from "./tasks/lint";

for (const file of git.getStagedFiles()) {
  if (lint(file)) {
    notify.success(file);
  }
}
