const path = require("path");
const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { Graph } = require("./helpers/graph");
const { Project } = require("./helpers/project");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const { workspace } = require("./helpers/workspace");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { diagnose } = require("./tasks/diagnose");
const { clean } = require("./tasks/clean");

const dependencies = new Graph();
// const diagnosedProjects = new Set();

/**
 * @param {Iterable<string>} files
 * @param {Project} [project]
 */
const handle = (files, project) => {
  files = [...files];
  for (const file of files) {
    project = project || workspace.projectFor(file);

    dependencies.addNode(file);

    for (const dependency of project.resolveImports(file)) {
      dependencies.addEdge(file, path.relative(process.cwd(), dependency));
    }
  }

  /**
   * @type {Set<string>}
   */
  const diagnosed = new Set();

  for (const file of files) {
    handleDiagnosation(file, diagnosed, project);
  }
};

/**
 * @param {string} file
 * @param {Set<string>} diagnosed
 * @param {Project} [project]
 */
const handleDiagnosation = function(file, diagnosed, project) {
  if (diagnosed.has(file)) {
    return;
  }

  project = project || workspace.projectFor(file);

  if (project.isChanged(file)) {
    const start = now();

    if (diagnose(file, project)) {
      const duration = now(start);

      notify.success(
        `${file} ${format(duration, { color: "yellow", threshold: 400 })}`
      );

      const edges = dependencies.getEdges(file);

      if (edges !== null) {
        const { incoming } = edges;

        for (const dependency of incoming) {
          handleDiagnosation(dependency, diagnosed, project);
        }
      }
    } else {
      process.exit(1);
    }

    diagnosed.add(file);
  }

  build(file, project);
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
