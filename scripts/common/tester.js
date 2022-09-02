const os = require("os");
const async = require("async");
const exec = require("execa");

const { system } = require("./system");

exports.tester = {
  test(root = "packages") {
    async.eachLimit(
      system.readDirectory(root, [".spec.ts", ".spec.tsx"], ["node_modules"]),
      os.cpus().length,
      (fileName, done) => {
        exec
          .node(fileName.replace(/\.tsx?$/, ".js"), [], {
            nodeOptions: [...process.execArgv, "--enable-source-maps"],
            stdio: "inherit",
          })
          .then(
            () => done(),
            (err) => done(err)
          );
      },
      (err) => {
        if (err) {
          system.exit(1);
        }
      }
    );
  },
};
