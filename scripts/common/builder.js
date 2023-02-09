const ts = require("typescript");

const { host } = require("./host");
const { flags } = require("./flags");

exports.builder = ts.createSolutionBuilder(host, ["tsconfig.json"], {
  force: flags.force,
  verbose: true, // verbosity is now managed by different reporter implementations
});
