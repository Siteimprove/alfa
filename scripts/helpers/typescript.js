const path = require("path");
const TypeScript = require("typescript");

const { readFile, isFile } = require("./file-system");
const { Project } = require("./project");
const { Workspace, workspace } = require("./workspace");

const { createSourceFile, ScriptTarget, SyntaxKind } = TypeScript;

/**
 * @param {string} source
 * @param {string} [file]
 * @return {TypeScript.SourceFile}
 */
function parseSource(source, file = "anonymous.ts") {
  return createSourceFile(file, source, ScriptTarget.ES2015);
}

exports.parseSource = parseSource;

/**
 * @param {string} file
 * @return {TypeScript.SourceFile}
 */
function parseFile(file) {
  return parseSource(readFile(file), file);
}

exports.parseFile = parseFile;

/**
 * @param {string} file
 * @param {Project | Workspace} [project]
 * @return {boolean}
 */
function isTestable(file, project = workspace) {
  let isExported = false;

  return (
    true ===
    project.walk(file, node => {
      const { modifiers } = node;

      if (
        modifiers !== undefined &&
        modifiers.some(modifier => modifier.kind === SyntaxKind.ExportKeyword)
      ) {
        isExported = true;
      }

      switch (node.kind) {
        case SyntaxKind.ArrowFunction:
          const { parameters } = /** @type {TypeScript.ArrowFunction} */ (node);

          if (isExported && parameters.pos !== parameters.end) {
            // Exported arrow functions that take parameters exported are testable.
            return true;
          }
          break;

        case SyntaxKind.FunctionDeclaration:
          if (isExported) {
            // Exported functions are testable.
            return true;
          }
      }
    })
  );
}

exports.isTestable = isTestable;

/**
 * Return the path to specification file matching specified file
 *
 * @param {string} file
 * @return {string?}
 */
function getSpecification(file) {
  const base = path
    .dirname(file)
    .split(path.sep)
    .map((part, index) =>
      part === "src"
        ? "test"
        : part === "scripts" && index === 0
        ? `${part}${path.sep}test`
        : part
    )
    .join(path.sep);
  const extensions = [".ts", ".tsx"];

  for (const extension of extensions) {
    const spec = path.join(
      base,
      `${path.basename(file, path.extname(file))}.spec${extension}`
    );

    if (isFile(spec)) {
      return spec;
    }
  }

  return null;
}

exports.getSpecification = getSpecification;

/**
 * Does the specified file have a corresponding specification
 * @param {string} file
 * @return {boolean}
 */
function hasSpecification(file) {
  return getSpecification(file) !== null;
}

exports.hasSpecification = hasSpecification;
