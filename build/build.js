const { notify } = require("wsk");

const { glob } = require("./utils/file");
const babel = require("./tasks/babel/transform");
const typescript = require("./tasks/typescript/check");
const locale = require("./tasks/locale/transform");

async function build() {
  notify({
    message: "Build started...",
    display: ["gray"]
  });

  for (const file of await glob("packages/**/locale/*.hjson")) {
    await locale.onEvent(null, file, { silent: true });
  }

  for (const file of await glob("packages/**/*.ts{,x}")) {
    await babel.onEvent(null, file, { silent: true });
    await typescript.onEvent(null, file, { silent: true });
  }

  notify({
    message: "Build succeeded",
    display: "success"
  });
}

build();
