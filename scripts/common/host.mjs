import ts from "typescript";

import { system } from "./system.mjs";
import * as reporter from "./reporter.mjs";

export const host = ts.createSolutionBuilderWithWatchHost(
  system,
  /* createProgram */ undefined,
  reporter.diagnostic,
  reporter.status.build,
  reporter.status.watch,
);
