const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { workspace } = require("./helpers/workspace");
const { packages } = require("./helpers/meta");
const { forEach } = require("./helpers/iterable");
const time = require("./helpers/time");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { diagnose } = require("./tasks/diagnose");
const { clean } = require("./tasks/clean");

/**
 * @param {string} file
 * @param {string} pkg
 */
function handle(file, pkg) {
  const start = time.now();

  const project = workspace.projectFor(file);

  project.addFile(file);

  [...project.buildProgram()];

  const success = diagnose(file, project) && build(file, project);

  if (success) {
    const duration = time.now(start);

    notify.success(
      `${file} ${time.format(duration, { color: "yellow", threshold: 400 })}`
    );
  } else {
    process.exit(1);
  }
}

forEach(findFiles("scripts", endsWith(".js")), file => {
  handle(file, "scripts");
});

for (const pkg of packages) {
  const root = `packages/${pkg}`;

  clean(root);

  forEach(findFiles(`${root}/scripts`, endsWith(".js")), file => {
    handle(file, pkg);
  });

  forEach(findFiles(root, endsWith(".ts", ".tsx")), file => {
    handle(file, pkg);
  });
}

forEach(findFiles("docs", endsWith(".ts", ".tsx")), file => {
  handle(file, "docs");
});
