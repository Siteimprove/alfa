const { notify } = require("wsk");
const { format, check, getSupportInfo } = require("prettier");
const { read, write } = require("../../utils/file");
const { extension } = require("../../utils/path");

const extensions = getSupportInfo().languages.reduce(
  (extensions, language) => extensions.concat(language.extensions || []),
  []
);

function isSupported(path) {
  return extensions.includes(extension(path));
}

async function onEvent(event, path, options = {}) {
  try {
    const source = await read(path);
    const options = { filepath: path };

    if (isSupported(path)) {
      await write(path, format(source, options));

      if (typeof options.onWrite === "function") {
        await options.onWrite(path);
      }

      notify({
        message: "Linting succeeded",
        value: path,
        display: "success"
      });
    } else {
      notify({
        message: "Linting skipped",
        value: path,
        display: ["gray"]
      });
    }
  } catch (err) {
    notify({
      message: "Linting failed",
      value: path,
      display: "error",
      error: err
    });
  }
}

module.exports = { onEvent };
