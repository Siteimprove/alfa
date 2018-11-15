const { default: chalk } = require("chalk");
const path = require("path");
const TypeScript = require("typescript");
const { createTypeScriptSource } = require("./helpers/create-ts-source");
const { findFiles, isFile, writeFile } = require("./helpers/file-system");
const { endsWith, not } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");

const annotatedComment = ["@todo", "@hack", "@bug", "@fixme"];

/**
 * @param {Array<string>} files
 */
const handle = files => {
  for (const file of files) {
    const start = now();

    if (build(file)) {
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

let commentFileData = "";
const lines = /**@type {Set<String>} */ (new Set());

for (const pkg of packages) {
  const root = `packages/${pkg}`;

  clean(root);

  handle(findFiles(`${root}/scripts`, endsWith(".js")));

  const commentFiles = /** @type {string[]} */ ([]);
  const sourceFiles = /** @type {string[]} */ ([]);
  const compileMap = /** @type {Map<string, TypeScript.SourceFile>} */ (new Map());

  findFiles(root, file => true).forEach(file => {
    if (
      !(file.indexOf(`${path.sep}src${path.sep}`) === -1) &&
      endsWith(".ts", ".tsx")
    ) {
      // Typescript file is in source folder
      commentFiles.push(file);
      if (not(endsWith(".spec.ts", ".spec.tsx"))) {
        // File is a source file
        sourceFiles.push(file);
      }
      compileMap.set(file, createTypeScriptSource(file));
    }
  });

  computeComments(commentFiles, compileMap);

  checkSpecFile(sourceFiles, compileMap);

  handle(sourceFiles);
}

AssembleTODOSData();

writeFile("./TODOS.md", commentFileData);

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

/**
 * @param {string[]} commentFiles
 * @param {Map<string, TypeScript.SourceFile>} compileMap
 */
function computeComments(commentFiles, compileMap) {
  for (const file of commentFiles) {
    const compiled = compileMap.get(file);
    if (compiled === undefined) {
      continue;
    }

    // const comments = /**@type {TypeScript.CommentRange[]} */ ([]);
    const comments = /**@type {TypeScript.TextRange[]} */ ([]);

    /**
     * @param {TypeScript.Node} node
     */
    function visit(node) {
      const comment = TypeScript.getCommentRange(node);
      if (comment !== undefined) {
        comments.push(comment);
      }
      TypeScript.forEachChild(node, visit);
    }
    TypeScript.forEachChild(compiled, visit);

    if (comments !== undefined) {
      for (const comment of comments) {
        const start =
          compiled.getLineAndCharacterOfPosition(comment.pos).line + 1;

        const text = compiled.getText().substring(comment.pos, comment.end);
        const split = text.split("\r\n");
        for (let i = 0; i < split.length; i++) {
          const line = split[i].trim();
          for (const ac of annotatedComment) {
            if (line.toLowerCase().startsWith(`* ${ac}`)) {
              const url = `https://github.com/siteimprove/alfa/blob/master/${file.replace(
                /\\/g,
                "/"
              )}#L${start + i}`;
              lines.add(
                `* [${file}:${start + i}](${url}): ${line.substring(2)}\r\n`
              );
              break;
            }
          }
        }
      }
    }
  }
}

/**
 * @param {string[]} sourceFiles
 * @param {Map<string, TypeScript.SourceFile>} compileMap
 */
function checkSpecFile(sourceFiles, compileMap) {
  for (const file of sourceFiles) {
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

    const compiled = compileMap.get(file);
    if (
      potentialTestFiles.some(isFile) || // An associated test file was found
      compiled === undefined || // Should never happen
      !isTestable(compiled)
    ) {
      continue;
    }

    notify.warn(`${chalk.gray(file)} Missing spec file`); // This could be an error in the future and actually fail the build.
  }
}

function AssembleTODOSData() {
  const all = /**@type {Map<String, String[]>} */ (new Map());

  for (const line of lines) {
    for (const ac of annotatedComment) {
      if (line.toLowerCase().includes(`${ac}`)) {
        const list = all.get(ac);
        if (list !== undefined) {
          list.push(line);
          all.set(ac, list);
        } else {
          all.set(ac, [line]);
        }
        break;
      }
    }
  }
  for (const key of all.keys()) {
    commentFileData += "\r\n";
    commentFileData += `# ${key.substring(1, key.length).toUpperCase()}:\r\n`;
    const val = all.get(key);
    if (val === undefined) {
      continue;
    }
    for (const ln of val) {
      commentFileData += ln;
    }
  }
}
