const execa = require("execa");

const { system } = require("./system");

exports.tester = {
  test(root = "packages") {
    for (const fileName of system.readDirectory(root, [".spec.js"])) {
      execa
        .node(fileName, [], {
          nodeOptions: [
            ...process.execArgv,
            ...["--require", require.resolve("source-map-support/register")]
          ]
        })
        .catch(err => {
          system.write(err.stderr.trim() + "\n");
          system.exit(1);
        });
    }
  }
};
