const path = require("path");
const process = require("process");
const minimist = require("minimist");

const argv = minimist(process.argv.slice(2), {
  boolean: ["force", "verbose", "quiet", "pretty"],
});

exports.flags = {
  project: argv._[0] || path.relative(process.cwd(), process.env.INIT_CWD),
  force: argv.force,
  verbose: argv.verbose,
  quiet: argv.quiet,
  minimal: !argv.verbose && !argv.quiet,
  pretty: argv.pretty,
};
