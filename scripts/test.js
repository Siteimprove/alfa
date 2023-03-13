const async = require("async");
const exec = require("execa");
const os = require("os");

const { builder } = require("./common/builder");
const { flags } = require("./common/flags");
const { system } = require("./common/system");

const status = builder.build(flags.project);

if (status !== 0) {
  system.exit(status);
}

test(flags.project);

function test(root = "packages") {
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
}
