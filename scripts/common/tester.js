const os = require("os");
const async = require("async");
const exec = require("execa");

const { system } = require("./system");
const fs = require("fs");
const path = require("path");

exports.tester = {
  test(root = "packages") {
    // If testing a single rule, we hardcode the file to run.
    if (root.match(/^r\d$/)) {
      exec
        .node(
          path.join(
            "packages",
            "alfa-rules",
            "test",
            `sia-${root}`,
            "rule.spec.js"
          ),
          [],
          {
            nodeOptions: [...process.execArgv, "--enable-source-maps"],
            stdio: "inherit",
          }
        )
        .then(
          () => system.exit(0),
          () => system.exit(1)
        );
    }

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
