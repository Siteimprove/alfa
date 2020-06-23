const ts = require("typescript");

const { host } = require("./host");
const { flags } = require("./flags");

exports.watcher = ts.createSolutionBuilderWithWatch(host, ["tsconfig.json"], {
  force: flags.force,
  verbose: flags.verbose,
});
