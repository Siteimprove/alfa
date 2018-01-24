const { notify } = require("wsk");
const exec = require("execa");
const { Application } = require("typedoc");
const { glob } = require("../../utils/file");
const prettier = require("../prettier/transform");

async function onEvent(event, path) {
  try {
    const app = new Application({
      target: "es2015",
      module: "commonjs",
      mode: "file",
      readme: "none",
      theme: "markdown",
      logger: () => {},

      // Exclude everything except public APIs
      excludeExternals: true,
      excludePrivate: true,
      excludeProtected: true,
      excludeNotExported: true
    });

    let files;
    try {
      files = app.expandInputFiles([`${path}/src`]);
    } catch (err) {
      return notify({
        message: "Documentation skipped",
        value: path,
        display: ["gray"]
      });
    }

    const project = app.convert(files);

    if (project) {
      app.generateDocs(project, `${path}/docs`);

      notify({
        message: "Documentation generated",
        value: path,
        display: "success"
      });

      for (const file of await glob(`${path}/docs/**/*.md`)) {
        await prettier.onEvent(null, file)
      }
    }
  } catch (err) {
    notify({
      message: "Documentation failed",
      value: path,
      display: "error",
      error: err
    });
  }
}

module.exports = { onEvent };
