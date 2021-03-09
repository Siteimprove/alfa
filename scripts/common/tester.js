const os = require("os");
const async = require("async");
const exec = require("execa");

const { system } = require("./system");

exports.tester = {
  async test(root = "packages") {
    await async.eachLimit(
      system.readDirectory(root, [".spec.ts", ".spec.tsx"]),
      os.cpus().length,
      async (fileName) =>
        await exec.node(fileName.replace(/\.tsx?$/, ".js"), [], {
          nodeOptions: [...process.execArgv, "--enable-source-maps"],
          stdio: "inherit",
        })
    );
  },
};
