const os = require("os");
const execa = require("execa");

const { system } = require("./system");

const fork = (count, work) =>
  Promise.all(new Array(count).fill().map(() => work())).then(() => {});

exports.tester = {
  async test(root = "packages") {
    const queue = system.readDirectory(root, [".spec.ts", ".spec.tsx"]);

    await fork(os.cpus().length, async () => {
      while (queue.length > 0) {
        const fileName = queue.shift().replace(/\.tsx?$/, ".js");

        try {
          await execa.node(fileName, [], {
            nodeOptions: [
              ...process.execArgv,
              ...["--require", require.resolve("source-map-support/register")],
            ],
            stdio: "inherit",
          });
        } catch {
          system.exit(1);
        }
      }
    });
  },
};
