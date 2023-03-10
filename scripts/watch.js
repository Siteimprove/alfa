const ts = require("typescript");

const { flags } = require("./common/flags");
const { host } = require("./common/host");

const watcher = ts.createSolutionBuilderWithWatch(host, ["tsconfig.json"], {
  force: flags.force,
  verbose: flags.verbose,
});

watcher.build(flags.project);
