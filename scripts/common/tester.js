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
        .then(result => result.stdout === "" ?
          null :
          process.stdout.write(result.stdout.trim() + "\n"))
        .catch(err => {
          process.stdout.write(err.stdout.trim() + "\n");
          process.stderr.write(err.stderr.trim() + "\n");
          system.exit(1);
        });
    }
  }
};
