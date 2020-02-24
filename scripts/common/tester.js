const execa = require("execa");

const { system } = require("./system");

exports.tester = {
  test(root = "packages/alfa-dom/") {
    for (const fileName of system.readDirectory(root, [".spec.js"])) {
      execa
        .node(fileName, [], {
          nodeOptions: [
            ...process.execArgv,
            ...["--require", require.resolve("source-map-support/register")]
          ],
          stdio: "inherit"
        })
        .catch(_ => {
          system.exit(1);
        });
    }
  }
};
