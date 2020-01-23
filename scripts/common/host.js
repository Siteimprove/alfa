const ts = require("typescript");

const { system } = require("./system");
const reporter = require("./reporter");

exports.host = ts.createSolutionBuilderWithWatchHost(
  system,
  /* createProgram */ undefined,
  reporter.diagnostic,
  reporter.status.build,
  reporter.status.watch
);
