// @ts-check

const path = require("path");
const TypeScript = require("typescript");
const chalk = require("chalk");

const { writeFile } = require("../helpers/file-system");
const { notify } = require("../helpers/notify");
const { Workspace } = require("../helpers/workspace");

const workspace = new Workspace();

function compile(file) {
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
    const { line, character } = file.getLineAndCharacterOfPosition(
      diagnostic.start
    );

    const filePath = path.relative(process.cwd(), file.fileName);

    return `${chalk.dim(`${filePath}:${line + 1}`)} ${message}`;
  }

  return message;
}

module.exports = { compile };
