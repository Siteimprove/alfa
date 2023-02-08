const ts = require("typescript");

const { system } = require("./system");
const { flags } = require("./flags");
const verboseStatusReporter = ts.createBuilderStatusReporter;

/**
 * @type {ts.DiagnosticReporter}
 */
exports.diagnostic = ts.createDiagnosticReporter(system, flags.pretty);

exports.status = {
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
      system.write("\033[1A\033[13D\033[K");
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
