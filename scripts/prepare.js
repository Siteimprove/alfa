const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { Project } = require("./helpers/project");
const { packages } = require("./helpers/meta");
const time = require("./helpers/time");
const notify = require("./helpers/notify");
const { default: chalk } = require("chalk");

const { build } = require("./tasks/build");
const { format } = require("./tasks/format");
const { diagnose } = require("./tasks/diagnose");
const { clean } = require("./tasks/clean");

/**
 * @param {Iterable<string>} files
 * @param {Project} [project]
 */
const handle = (files, project) => {
  for (const file of files) {
    const start = time.now();

    if (diagnose(file, project) && build(file, project)) {
      const duration = time.now(start);

      notify.success(
        `${file} ${time.format(duration, { color: "yellow", threshold: 400 })}`
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

  handle(
    findFiles(root, endsWith(".ts", ".tsx")),

    // Construct a project for use solely within the current scope, ensuring
    // that allocated resources can be freed as soon as the package has been
    // handled.
    new Project(`${root}/tsconfig.json`)
  );
}

handle(findFiles("docs", endsWith(".ts", ".tsx")));
