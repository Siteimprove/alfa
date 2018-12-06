const path = require("path");
const { createTypeScriptSource } = require("./helpers/compile-ts-source");
const { findFiles, readFile } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { default: chalk } = require("chalk");
const { Project } = require("./helpers/project");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const { isTestable, hasSpecification } = require("./helpers/typescript");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");
const {
  computeComments,
  createTODOSFile
} = require("./helpers/comment-computing");
const { checkSpecFile } = require("./helpers/specfile-identifier");

/**
 * @param {Iterable<string>} files
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

  findFiles(root, endsWith(".ts", ".tsx")).forEach(file => {
    const source = createTypeScriptSource(readFile(file));
    computeComments(file, source);
    handle([file], project);
    if (!(file.indexOf(`${path.sep}src${path.sep}`) === -1)) {
      checkSpecFile(file, source);
    }
  });
}

createTODOSFile();

handle(findFiles("docs", endsWith(".ts", ".tsx")));