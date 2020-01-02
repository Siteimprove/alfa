const { findFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { workspace } = require("./helpers/workspace");
const { packages } = require("./helpers/meta");
const time = require("./helpers/time");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { diagnose } = require("./tasks/diagnose");
const { clean } = require("./tasks/clean");

/**
 * @param {string} file
 */
function handle(file) {
  const start = time.now();

  const project = workspace.projectFor(file);

  project.addFile(file);

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

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @param {(item: T) => void} iteratee
 */
function each(iterable, iteratee) {
  for (const item of iterable) {
    iteratee(item);
  }
}

each(findFiles("scripts", endsWith(".js")), handle);

for (const pkg of packages) {
  const root = `packages/${pkg}`;

  clean(root);

  each(findFiles(`${root}/scripts`, endsWith(".js")), handle);

  each(findFiles(root, endsWith(".ts", ".tsx")), handle);
}

each(findFiles("docs", endsWith(".ts", ".tsx")), handle);
