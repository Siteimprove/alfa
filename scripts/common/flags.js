const process = require("process");
const minimist = require("minimist");

const argv = minimist(process.argv.slice(2), {
  boolean: ["force", "verbose", "pretty"],
});

exports.flags = {
  project: argv._[0],
  force: argv.force,
  verbose: argv.verbose,
  pretty: argv.pretty,
};
