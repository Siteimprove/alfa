import { system } from "./common/system.mjs";
import { flags } from "./common/flags.mjs";
import { builder } from "./common/builder.mjs";

const exitCode = builder.build(flags.project);

if (flags.minimal && exitCode === /*Success*/ 0) {
  // Move cursor up one line and 13 to the left and erase
  system.write("\x1B[1A\x1B[13D\x1B[K");
  system.write("done!" + system.newLine);
}

system.exit(exitCode);
