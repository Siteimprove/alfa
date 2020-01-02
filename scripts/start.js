const { watchFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const { workspace } = require("./helpers/workspace");
const { getSpecification } = require("./helpers/meta");
const time = require("./helpers/time");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { diagnose } = require("./tasks/diagnose");
const { test } = require("./tasks/test");

const isSpec = endsWith(".spec.ts", ".spec.tsx");

watchFiles(
  [
    "packages/**/*.ts",
    "packages/**/*.tsx",
    "packages/**/scripts/**/*.js",
    "scripts/**/*.js",
    "docs/**/*.ts",
    "docs/**/*.tsx"
  ],
  (event, file) => {
    const start = time.now();

    const project = workspace.projectFor(file);

    project.addFile(file);

    let success = diagnose(file, project) && build(file, project);

    if (isSpec(file)) {
      success = success && test(file);
    } else {
      const spec = getSpecification(file);

      if (spec !== null) {
        success = success && test(spec);
      }
    }

    if (success) {
      const duration = time.now(start);

      notify.success(
        `${file} ${time.format(duration, {
          color: "yellow",
          threshold: 400
        })}`
      );
    }
  }
);

notify.watch("Watching files for changes");
