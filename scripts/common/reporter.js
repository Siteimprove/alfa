const ts = require("typescript");

const { system } = require("./system");

/**
 * @type {ts.DiagnosticReporter}
 */
exports.diagnostic = ts.createDiagnosticReporter(system);

exports.status = {
  /**
   * @type {ts.DiagnosticReporter}
   */
  build: ts.createBuilderStatusReporter(system),

  /**
   * @type {ts.DiagnosticReporter}
   */
  watch: ts.createWatchStatusReporter(system)
};
