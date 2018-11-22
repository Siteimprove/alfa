const { createTypeScriptSource } = require("./helpers/compile-ts-source");
const { findFiles, readFile } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const notify = require("./helpers/notify");
const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");
const {
  computeComments,
  createTODOSFile
} = require("./helpers/comment-computing");
const {
  computeSpecCheck,
  createMissingSpecFile
} = require("./helpers/qa-computing");

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

for (const pkg of packages) {
  const root = `packages/${pkg}`;

  clean(root);

  handle(findFiles(`${root}/scripts`, endsWith(".js")));

  findFiles(root, endsWith(".ts", ".tsx")).forEach(file => {
    const source = createTypeScriptSource(readFile(file));
    computeComments(file, source);
    handle([file]);
    computeSpecCheck(file, source);
  });
}

createTODOSFile();

createMissingSpecFile();

handle(findFiles("docs", endsWith(".ts", ".tsx")));
