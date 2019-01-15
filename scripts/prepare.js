const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { Project } = require("./helpers/project");
const { workspace } = require("./helpers/workspace");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const notify = require("./helpers/notify");
const { build } = require("./tasks/build");
const { diagnose } = require("./tasks/diagnose");
const { clean } = require("./tasks/clean");
const TypeScript = require("typescript");
const { computeComments, createTODOSFile } = require("./helpers/todos");

/**
 * @typedef {Object} AnnotadedComment
 * @property {string} file
 * @property {TypeScript.TodoComment} comment
 */

/**
 * @type {Array<AnnotadedComment>}
 */
const todos = [];

/**
 * @param {Iterable<string>} files
 * @param {Project} [project]
 */
const handle = (files, project) => {
  for (const file of files) {
    project = project || workspace.projectFor(file);
    const start = now();

    if (diagnose(file, project) && build(file, project)) {
      const duration = now(start);
      notify.success(
        `${file} ${format(duration, { color: "yellow", threshold: 400 })}`
      );
    } else {
      process.exit(1);
    }

    todos.push(...computeComments(file, project));
  }
};

handle(findFiles("scripts", endsWith(".js")));

for (const pkg of packages) {
  const root = `packages/${pkg}`;

  clean(root);

  handle(findFiles(`${root}/scripts`, endsWith(".js")));

  handle(
    findFiles(root, endsWith(".ts", ".tsx")),

    // Construct a project for use solely within the current scope, ensuring
    // that allocated resources can be freed as soon as the package has been
    // handled.
    new Project(`${root}/tsconfig.json`)
  );
}
createTODOSFile(todos);

handle(findFiles("docs", endsWith(".ts", ".tsx")));
