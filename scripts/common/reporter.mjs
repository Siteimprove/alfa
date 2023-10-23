import ts from "typescript";

import { system } from "./system.mjs";
import { flags } from "./flags.mjs";
const verboseStatusReporter = ts.createBuilderStatusReporter;

/**
 * @type {ts.DiagnosticReporter}
 */
export const diagnostic = ts.createDiagnosticReporter(system, flags.pretty);

export const status = {
  /**
   * @type {ts.DiagnosticReporter}
   */
  build: flags.verbose
    ? verboseStatusReporter(system, flags.pretty)
    : flags.quiet
    ? quietStatusReporter
    : minimalStatusReporter(system, flags.pretty),

  /**
   * @type {ts.DiagnosticReporter}
   */
  watch: ts.createWatchStatusReporter(system, flags.pretty),
};

function quietStatusReporter(_system, _pretty) {
  return function (_diag) {};
}

function minimalStatusReporter(system, _) {
  let first = true;
  let frameIndex = 0;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  return function (diag) {
    if (!first) {
      // Move cursor up one line and 13 to the left and erase
      system.write("\x1B[1A\x1B[13D\x1B[K");
    }

    const frame = frames[frameIndex % frames.length];

    const packageName = !first
      ? diag.messageText.match(/.*(?:\/|')(.*)\/tsconfig\.json/)?.[1] ?? ""
      : "";

    system.write(frame + ` building ${packageName}`);
    system.write(system.newLine);
    frameIndex++;
    first = false;
  };
}
