const execa = require("execa");

const { system } = require("./system");

exports.tester = {
  test(root = "packages") {
    for (let fileName of system.readDirectory(root, [".spec.ts", ".spec.tsx"])) {
      fileName = fileName.replace(/\.tsx?$/, ".js");
      execa
        .node(fileName, [], {
          nodeOptions: [
            ...process.execArgv,
            ...["--require", require.resolve("source-map-support/register")]
          ],
          stdio: "inherit"
        })
        .catch(err => {
          system.exit(1);
        });
    }
  }
};
