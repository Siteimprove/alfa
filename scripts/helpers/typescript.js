const path = require("path");
const TypeScript = require("typescript");

const { readFile, isFile } = require("./file-system");
const { Project } = require("./project");
const { workspace } = require("./workspace");

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
 * @param {Project} [project]
 * @return {boolean}
 */
function isTestable(file, project = workspace.projectFor(file)) {
  let isExported = false;

  return (
    true ===
    project.forEachChild(file, node => {
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
 * @param {string} file
 * @return {boolean}
 */
function hasSpecification(file) {
  const base = path
    .dirname(file)
    .split(path.sep)
    .map(part => (part === "src" ? "test" : part))
    .join(path.sep);

  const extensions = [".ts", ".tsx"];

  for (const n of extensions) {
    for (const m of extensions) {
      const spec = path.join(base, `${path.basename(file, n)}.spec${m}`);

      if (isFile(spec)) {
        return true;
      }
    }
  }

  return false;
}

exports.hasSpecification = hasSpecification;
