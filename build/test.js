const { notify } = require("wsk");

const { glob } = require("./utils/file");
const tap = require("./tasks/tap/test");

const config = {
  silent: true
};

notify({
  message: "Tests started...",
  display: ["gray"]
});

glob("packages/**/*.spec.ts{,x}")
  .then(async files =>
    Promise.all(files.map(file => tap.onEvent(null, file, config)))
  )
  .then(() =>
    notify({
      message: "Tests succeeded!",
      display: "success"
    })
  );
