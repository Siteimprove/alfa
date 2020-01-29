const ts = require("typescript");

const { system } = require("./system");
const { flags } = require("./flags");

/**
 * @type {ts.DiagnosticReporter}
 */
exports.diagnostic = ts.createDiagnosticReporter(system, flags.pretty);

exports.status = {
  /**
   * @type {ts.DiagnosticReporter}
   */
  build: ts.createBuilderStatusReporter(system, flags.pretty),

  /**
   * @type {ts.DiagnosticReporter}
   */
  watch: ts.createWatchStatusReporter(system, flags.pretty)
};
