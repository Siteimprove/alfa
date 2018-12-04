const { default: chalk } = require("chalk");
const path = require("path");
const TypeScript = require("typescript");

const { findFiles, isFile, readFile } = require("./helpers/file-system");
const { endsWith, not } = require("./helpers/predicates");
const { Project } = require("./helpers/project");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");

/**
 * @param {Array<string>} files
 * @param {Project} [project]
 */
const handle = (files, project) => {
  for (const file of files) {
    const start = now();

    if (build(file, project)) {
      const duration = now(start);

      notify.success(
        `${file} ${format(duration, { color: "yellow", threshold: 400 })}`
      );
    } else {
      process.exit(1);
    }
  }
};

handle(findFiles("scripts", endsWith(".js")));

for (const pkg of packages) {
  const root = `packages/${pkg}`;
  const project = new Project(`${root}/tsconfig.json`);

  clean(root);

  handle(findFiles(`${root}/scripts`, endsWith(".js")));

  const files = findFiles(root, endsWith(".ts", ".tsx")).filter(
    not(endsWith(".spec.ts", ".spec.tsx"))
  );

  for (const file of files) {
    if (file.indexOf(`${path.sep}src${path.sep}`) === -1) {
      continue; // File is not in source folder
    }

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

    if (potentialTestFiles.some(isFile)) {
      continue; // An associated test file was found
    }

    const compiled = TypeScript.createSourceFile(
      "anon.ts",
      readFile(file),
      TypeScript.ScriptTarget.ES2015
    );

    if (!isTestable(compiled)) {
      continue;
    }

    notify.warn(`${chalk.gray(file)} Missing spec file`); // This could be an error in the future and actually fail the build.
  }

  handle(files, project);
}

handle(findFiles("docs", endsWith(".ts", ".tsx")));

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
