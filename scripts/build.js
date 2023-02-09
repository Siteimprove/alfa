const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { builder } = require("./common/builder");

const exitCode = builder.build(flags.project);

if (flags.minimal && exitCode === /*Success*/ 0) {
  // Move cursor up one line and 13 to the left and erase
  system.write("\033[1A\033[13D\033[K");
  system.write("done!" + system.newLine);
}

system.exit(exitCode);
