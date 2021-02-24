const os = require("os");
const child_process = require("child_process");

const { system } = require("./system");

const fork = (count, work) =>
  Promise.all(new Array(count).fill().map(() => work())).then(() => {});

exports.tester = {
  async test(root = "packages") {
    const queue = system.readDirectory(root, [".spec.ts", ".spec.tsx"]);

    await fork(os.cpus().length, async () => {
      while (queue.length > 0) {
        const fileName = queue.shift().replace(/\.tsx?$/, ".js");

        const child = child_process.fork(fileName, [], {
          execArgv: [...process.execArgv, "--enable-source-maps"],
          stdio: "inherit",
        });

        await new Promise((resolve) =>
          child.on("close", (code) => {
            if (code !== 0) {
              system.exit(1);
            } else {
              resolve();
            }
          })
        );
      }
    });
  },
};
