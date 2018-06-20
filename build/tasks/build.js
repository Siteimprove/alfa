import * as path from "path";
import * as TypeScript from "typescript";
import chalk from "chalk";

import { writeFile } from "../helpers/file-system";
import { Workspace } from "../helpers/workspace";
import * as notify from "../helpers/notify";

const workspace = new Workspace();

/**
 * @param {string} file
 * @return {boolean}
 */
export function build(file) {
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
    const { line } = file.getLineAndCharacterOfPosition(diagnostic.start);

    const filePath = path.relative(process.cwd(), file.fileName);

    return `${chalk.dim(`${filePath}:${line + 1}`)} ${message}`;
  }

  return message;
}
