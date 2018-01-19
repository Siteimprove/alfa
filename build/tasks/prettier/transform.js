const { notify } = require("wsk");
const { format } = require("prettier");
const { read, write } = require("../../utils/file");

async function onEvent(event, path, options = {}) {
  try {
    const source = await read(path);
    const formatted = format(source, { filepath: path });

    if (source !== formatted) {
      await write(path, formatted);

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
