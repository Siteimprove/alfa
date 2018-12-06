const path = require("path");
const TypeScript = require("typescript");
const TSLint = require("tslint");
const { default: chalk } = require("chalk");

const { writeFile } = require("../helpers/file-system");
const { Workspace, workspace } = require("../helpers/workspace");
const { Project } = require("../helpers/project");
const notify = require("../helpers/notify");
const { format } = require("./format");

/**
 * @param {string} file
 * @param {Workspace | Project} [project]
 * @return {boolean}
 */
function build(file, project = workspace) {
  if (process.env.CI === "true" && format(file)) {
    notify.error(`${chalk.gray(file)}: File has not been formatted`);
    return false;
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

  const compiled = project.compile(file);

  for (const { name, text } of compiled) {
    writeFile(name, text);
  }

  return true;
}

exports.build = build;

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
