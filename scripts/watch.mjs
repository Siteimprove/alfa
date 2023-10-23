import ts from "typescript";

import { flags } from "./common/flags.mjs";
import { host } from "./common/host.mjs";

const watcher = ts.createSolutionBuilderWithWatch(host, ["tsconfig.json"], {
  force: flags.force,
  verbose: flags.verbose,
});

watcher.build(flags.project);
