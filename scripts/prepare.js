const { findFiles } = require("./helpers/file-system");
const { endsWith, not } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const { default: chalk } = require("chalk");
const notify = require("./helpers/notify");
const fs = require("fs");
const path = require("path");

const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");

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

  const files = findFiles(root, endsWith(".ts", ".tsx")).filter(
    not(endsWith(".spec.ts", ".spec.tsx"))
  );

  for (const file of files) {
    const dir = path
      .dirname(file)
      .split(path.sep)
      .map(part => (part === "src" ? "test" : part))
      .join(path.sep);
    const testFile = path.join(dir, `${path.basename(file, ".ts")}.spec.ts`);

    if (!fs.existsSync(testFile)) {
      notify.warn(`${chalk.dim(file)}: Missing spec file`); // This could be an error in the future and actually fail the build.
    }
  }

  handle(files);
}

handle(findFiles("docs", endsWith(".ts", ".tsx")));
