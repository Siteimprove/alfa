// @ts-check

const path = require("path");
const TypeScript = require("typescript");
const chalk = require("chalk");

/**
 * @param {object} diagnostic
 * @return {string}
 */
function formatDiagnostic(diagnostic) {
  const message = TypeScript.flattenDiagnosticMessageText(
    diagnostic.messageText,
    "\n"
  );

  const { file } = diagnostic;

  if (file) {
    const { line, character } = file.getLineAndCharacterOfPosition(
      diagnostic.start
    );

    const filePath = path.relative(process.cwd(), file.fileName);

    return `${chalk.dim(`${filePath}:${line + 1}`)} ${message}`;
  }

  return message;
}

module.exports = { formatDiagnostic };
