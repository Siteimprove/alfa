const { default: chalk } = require("chalk");

const { findFiles } = require("./helpers/file-system");
const { and, endsWith, not } = require("./helpers/predicates");
const { Project } = require("./helpers/project");
const { packages } = require("./helpers/meta");
const { format, now } = require("./helpers/time");
const { isTestable, hasSpecification } = require("./helpers/typescript");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");

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

  for (const file of findFiles(`${root}/src`, endsWith(".ts"))) {
    if (isTestable(file, project) && !hasSpecification(file)) {
      notify.warn(`${chalk.gray(file)} Missing spec file`);
    }
  }

  handle(
    findFiles(
      root,
      and(endsWith(".ts", ".tsx"), not(endsWith(".spec.ts", ".spec.tsx")))
    ),
    project
  );
}

handle(findFiles("docs", endsWith(".ts", ".tsx")));
