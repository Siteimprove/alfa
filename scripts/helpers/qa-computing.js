const TypeScript = require("typescript");
const path = require("path");
const { isFile, removeFile, writeFile } = require("./file-system");
const notify = require("./notify");
const { default: chalk } = require("chalk");
const { formattedDateTime } = require("./time");

const lines = /**@type {Set<String>} */ (new Set());

/**
 * @param {string} file
 * @param {TypeScript.SourceFile} source
 */
function computeSpecCheck(file, source) {
  if (!(file.indexOf(`${path.sep}src${path.sep}`) === -1)) {
    if (checkSpecFile(file, source) === -1) {
      lines.add(file);
    }
  }
}

exports.computeSpecCheck = computeSpecCheck;

function createMissingSpecFile() {
  if (lines.size === 0) {
    if (isFile("MissingSpecFiles.md")) removeFile("MissingSpecFiles.md");
    return;
  }
  let msFileData = "";

  msFileData += `### Last updated: ${formattedDateTime()}\r\n`;
  msFileData += "# Missing Spec Files:\r\n";
  for (const line of lines) {
    msFileData += `* ${line}\r\n`;
  }
  writeFile("./MissingSpecFiles.md", msFileData);
}

exports.createMissingSpecFile = createMissingSpecFile;

/**
 * @param {TypeScript.Node} node
 */
function isTestable(node, testable = false, exporting = false) {
  if (
    node.modifiers &&
    node.modifiers.some(el => el.kind === TypeScript.SyntaxKind.ExportKeyword)
  ) {
    exporting = true;
  }
  switch (node.kind) {
    case TypeScript.SyntaxKind.ArrowFunction:
      const arrowFunction = /** @type {TypeScript.ArrowFunction} */ (node);
      if (
        exporting &&
        arrowFunction.parameters.pos !== arrowFunction.parameters.end
      ) {
        // Arrow functions that takes parameters and are somehow being exported are testable
        return true;
      }
      break;
    case TypeScript.SyntaxKind.FunctionDeclaration:
      if (exporting) {
        // Functions that are somehow being exported are testable
        return true;
      }
      break;
  }

  TypeScript.forEachChild(node, node => {
    testable = testable || isTestable(node, testable, exporting);
  });

  return testable;
}

/**
 * @param {string} file
 * @param {TypeScript.SourceFile} source
 */
function checkSpecFile(file, source) {
  const dir = path
    .dirname(file)
    .split(path.sep)
    .map(part => (part === "src" ? "test" : part))
    .join(path.sep);

  const potentialTestFiles = [
    // TS source with TS test file
    path.join(dir, `${path.basename(file, ".ts")}.spec.ts`),
    // TSX source with TS test file
    path.join(dir, `${path.basename(file, ".tsx")}.spec.ts`),
    // TSX source with TSX test file
    path.join(dir, `${path.basename(file, ".tsx")}.spec.tsx`),
    // TS source with TSX test file
    path.join(dir, `${path.basename(file, ".ts")}.spec.tsx`)
  ];
  if (
    potentialTestFiles.some(isFile) || // An associated test file was found
    source === undefined || // Should never happen
    !isTestable(source)
  ) {
    return 0; // spec file exists or cannot determine its existance
  }

  notify.warn(`${chalk.gray(file)} Missing spec file`); // This could be an error in the future and actually fail the build.
  return -1; // spec file missing
}
