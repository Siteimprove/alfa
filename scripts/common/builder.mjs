import ts from "typescript";

import { host } from "./host.mjs";
import { flags } from "./flags.mjs";

export const builder = ts.createSolutionBuilder(host, ["tsconfig.json"], {
  force: flags.force,
  verbose: true, // verbosity is now managed by different reporter implementations
});
