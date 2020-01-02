const path = require("path");
const TypeScript = require("typescript");
const chalk = require("chalk");

const { workspace } = require("../helpers/workspace");
const { Project } = require("../helpers/project");
const notify = require("../helpers/notify");

/**
 * @param {string} file
 * @param {Project} [project]
 * @return {boolean}
 */
function diagnose(file, project = workspace.projectFor(file)) {
  const diagnostics = [...project.getDiagnostics(file)];

  if (diagnostics.length > 0) {
    for (const diagnostic of diagnostics) {
      notify.error(formatDiagnostic(diagnostic));
    }

    return false;
  }

  return true;
}

exports.diagnose = diagnose;

/**
 * @param {TypeScript.Diagnostic} diagnostic
 * @return {string}
 */
function formatDiagnostic(diagnostic) {
  const message = TypeScript.flattenDiagnosticMessageText(
    diagnostic.messageText,
    "\n"
  );

  const { file } = diagnostic;

  if (file && diagnostic.start !== undefined) {
    const { line } = file.getLineAndCharacterOfPosition(diagnostic.start);

    const filePath = path.relative(process.cwd(), file.fileName);

    return `${chalk.gray(`${filePath}:${line + 1}`)} ${message}`;
  }

  return message;
}
