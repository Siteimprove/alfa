const TypeScript = require("typescript");
const path = require("path");
const { isFile, removeFile, writeFile } = require("./file-system");
const notify = require("./notify");
const { default: chalk } = require("chalk");
const { formattedDateTime } = require("./time");

const ms = "MISSINGSPEC.md";
const coverage = "COVERAGE.md";

const msLines = /**@type {Set<String>} */ (new Set());
const covLines = /**@type {Set<String>} */ (new Set());

/**
 * @param {string} file
 * @param {TypeScript.SourceFile} source
 */
function computeSpecCheck(file, source) {
  if (!(file.indexOf(`${path.sep}src${path.sep}`) === -1)) {
    if (checkSpecFile(file, source) === -1) {
      msLines.add(file);
    }
  }
}

exports.computeSpecCheck = computeSpecCheck;

function createMissingSpecFile() {
  if (msLines.size === 0) {
    if (isFile(ms)) removeFile(ms);
    return;
  }
  let msFileData = "";

  msFileData += `Last updated: ${formattedDateTime()}\r\n`;
  msFileData += "# Missing Spec Files:\r\n";
  for (const line of msLines) {
    msFileData += `* ${line}\r\n`;
  }
  writeFile(`./${ms}`, msFileData);
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

/**
 *@param {string} details
 */
function addCoverage(details) {
  covLines.add(`* ${details}`);
}

exports.addCoverage = addCoverage;

function createCoverageFile() {
  if (covLines.size === 0) {
    console.log("i am here");
    if (isFile(coverage)) removeFile(coverage);
    return;
  }
  let coverageFileData = "";
  coverageFileData += `Last updated: ${formattedDateTime()}\r\n`;
  coverageFileData += `# Low Coverage:\r\n`;
  for (const line of covLines) {
    coverageFileData += `* ${line}\r\n`;
  }
  coverageFileData += "\r\n";
  writeFile(`./${coverage}`, coverageFileData);
}

exports.createCoverageFile = createCoverageFile;
