const { watchFiles } = require("./helpers/file-system");
const { endsWith } = require("./helpers/predicates");
const time = require("./helpers/time");
const { workspace } = require("./helpers/workspace");
const notify = require("./helpers/notify");
const { getSpecification } = require("./helpers/typescript");
const { default: chalk } = require("chalk");

const { build } = require("./tasks/build");
const { diagnose } = require("./tasks/diagnose");
const { test } = require("./tasks/test");

const isSpec = endsWith(".spec.ts", ".spec.tsx");

/**
 * These are files which failed at last run
 * Saved so we can process them again when next file changes
 *
 * @type {Array<string>}
 */
let failed = [];
let rerunFailed = process.argv.some(v => v.toLowerCase() === "--rerun-failed");

watchFiles(
  [
    "packages/**/*.ts",
    "packages/**/*.tsx",
    "packages/**/scripts/**/*.js",
    "scripts/**/*.js",
    "scripts/test/**/*.ts",
    "!scripts/test/**/*.js",
    "docs/**/*.ts",
    "docs/**/*.tsx"
  ],
  (event, file) => {
    failed = failed.filter(v => v !== file);

    const fileList = [file, ...(rerunFailed ? failed : [])];

    if (rerunFailed) {
      failed = [];
    }

    fileList.forEach(file => {
      const start = time.now();

      const project = workspace.projectFor(file);

      if (project.addFile(file)) {
        [...project.buildProgram()];
      }

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

        if (!rerunFailed && failed.length > 0) {
          failed.forEach(file => {
            notify.warn(`${chalk.gray(file)} Failed previously`);
          });
        }
      } else {
        failed.push(file);
      }
    });
  }
);

notify.watch("Watching files for changes");
