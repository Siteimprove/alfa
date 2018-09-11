const { findFiles } = require("./helpers/file-system");
const { endsWith, not } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");

/**
 * @param {Array<string>} files
 */
const handle = files => {
  for (const file of files) {
    if (build(file)) {
      notify.success(file);
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
    findFiles(root, endsWith(".ts", ".tsx")).filter(
      not(endsWith(".spec.ts", ".spec.tsx"))
    )
  );
}

handle(findFiles("docs", endsWith(".ts", ".tsx")));
