import * as path from "path";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2), {
  boolean: ["force", "verbose", "quiet", "pretty"],
});

export const flags = {
  project: argv._[0] || path.relative(process.cwd(), process.env.INIT_CWD),
  force: argv.force,
  verbose: argv.verbose,
  quiet: argv.quiet,
  minimal: !argv.verbose && !argv.quiet,
  pretty: argv.pretty,
};
