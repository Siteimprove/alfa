const { default: chalk } = require("chalk");
const fs = require("fs");
const path = require("path");
const TypeScript = require("typescript");

const { findFiles, isFile } = require("./helpers/file-system");
const { endsWith, not } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");

const { Logical } = require("./helpers/metrics/logical");
const { Arithmetic } = require("./helpers/metrics/arithmetic");

const metrics = [Arithmetic, Logical];

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

    const tsTestFile = path.join(dir, `${path.basename(file, ".ts")}.spec.ts`);
    const tsxTestFile = path.join(
      dir,
      `${path.basename(file, ".tsx")}.spec.tsx`
    );

    if (isFile(tsTestFile) || isFile(tsxTestFile)) {
      continue; // Found an associated test file
    }

    const compiled = TypeScript.createSourceFile(
      "anon.ts",
      fs.readFileSync(file).toString(),
      TypeScript.ScriptTarget.ES2015
    );

    let operators = metrics.reduce(
      (acc, metric) => acc + metric.visit(compiled),
      0
    );

    if (operators <= 0) {
      continue;
    }

    notify.warn(`${chalk.gray(file)} Missing spec file`); // This could be an error in the future and actually fail the build.
  }

  handle(files);
}

handle(findFiles("docs", endsWith(".ts", ".tsx")));
