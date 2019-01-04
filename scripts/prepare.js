const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { Project } = require("./helpers/project");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { diagnose } = require("./tasks/diagnose");
const { clean } = require("./tasks/clean");

/**
 * @param {Iterable<string>} files
 * @param {Project} project
 */
const handle = (files, project) => {
  for (const file of files) {
    project.addFile(file);
  }

  for (const file of project.buildProgram()) {
    const start = now();

    if (diagnose(file, project) && build(file, project)) {
      const duration = now(start);

      notify.success(
        `${file} ${format(duration, { color: "yellow", threshold: 400 })}`
      );
    } else {
      process.exit(1);
    }
  }
};

// handle(findFiles("scripts", endsWith(".js")), new Project("scripts/tsconfig.json"));

for (const pkg of packages) {
  const root = `packages/${pkg}`;

  clean(root);

  // handle(findFiles(`${root}/scripts`, endsWith(".js")), new Project(`${root}/scripts/tsconfig.json`));

  handle(
    findFiles(root, endsWith(".ts", ".tsx")),

    // Construct a project for use solely within the current scope, ensuring
    // that allocated resources can be freed as soon as the package has been
    // handled.
    new Project(`${root}/tsconfig.json`)
  );
}

// handle(findFiles("docs", endsWith(".ts", ".tsx")));
