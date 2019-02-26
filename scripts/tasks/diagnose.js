const path = require("path");
const TypeScript = require("typescript");
const TSLint = require("tslint");
const { default: chalk } = require("chalk");

const { Workspace, workspace } = require("../helpers/workspace");
const { Project } = require("../helpers/project");
const { isTestable, hasSpecification } = require("../helpers/typescript");
const notify = require("../helpers/notify");

/**
 * @param {string} file
 * @param {Project | Workspace} [project]
 * @return {boolean}
 */
function diagnose(file, project = workspace) {
  if (
    file.includes("src") &&
    file.endsWith(".ts") &&
    !hasSpecification(file) &&
    isTestable(file, project)
  ) {
    notify.warn(`${chalk.gray(file)} Missing spec file`);
  }

  const diagnostics = project.diagnose(file);

  if (diagnostics.length > 0) {
    for (const diagnostic of diagnostics) {
      notify.error(formatDiagnostic(diagnostic));
    }

    return false;
  }

  const failures = project.lint(file);

  if (failures.length > 0) {
    let error = false;

    for (const failure of failures) {
      switch (failure.getRuleSeverity()) {
        case "error":
          error = true;
          notify.error(formatFailure(failure));
          break;
        case "warning":
          notify.warn(formatFailure(failure));
      }
    }

    if (error) {
      return false;
    }
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

/**
 * @param {TSLint.RuleFailure} failure
 * @return {string}
 */
function formatFailure(failure) {
  const message = failure.getFailure();
  const { line } = failure.getStartPosition().getLineAndCharacter();

  const filePath = path.relative(process.cwd(), failure.getFileName());

  return `${chalk.gray(`${filePath}:${line + 1}`)} ${message}`;
}
