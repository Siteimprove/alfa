const { notify } = require("wsk");
const { glob } = require("./utils/file");
const typedoc = require("./tasks/typedoc/generate");

async function document() {
  for (const package of await glob("packages/*")) {
    await typedoc.onEvent(null, package, { silent: true });
  }
}

document();
