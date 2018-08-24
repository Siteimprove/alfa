import * as path from "path";
import * as TypeScript from "typescript";
import * as TSLint from "tslint";
import chalk from "chalk";

import { writeFile } from "../helpers/file-system";
import { workspace } from "../helpers/workspace";
import * as notify from "../helpers/notify";

/**
 * @param {string} file
 * @return {boolean}
 */
export function build(file) {
  const failures = workspace.lint(file);

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

  const diagnostics = workspace.diagnose(file);

  if (diagnostics.length > 0) {
    for (const diagnostic of diagnostics) {
      notify.error(formatDiagnostic(diagnostic));
    }

    return false;
  }

  const compiled = workspace.compile(file);

  for (const { name, text } of compiled) {
    writeFile(name, text);
  }

  return true;
}

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
