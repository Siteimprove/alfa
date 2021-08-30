const os = require("os");
const async = require("async");
const exec = require("execa");

const { system } = require("./system");
const fs = require("fs");

exports.tester = {
  test(root = "packages") {
    async.eachLimit(
      system.readDirectory(root, [".spec.ts", ".spec.tsx"], ["node_modules"]),
      os.cpus().length,
      (fileName, done) => {
        if (fs.existsSync(fileName.replace(/\.tsx?$/, ".js"))) {
          exec
            .node(fileName.replace(/\.tsx?$/, ".js"), [], {
              nodeOptions: [...process.execArgv, "--enable-source-maps"],
              stdio: "inherit",
            })
            .then(
              () => done(),
              (err) => done(err)
            );
        }
      },
      (err) => {
        if (err) {
          system.exit(1);
        }
      }
    );
  },
};
