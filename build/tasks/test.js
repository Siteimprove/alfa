const { default: chalk } = require("chalk");

const { withExtension } = require("../helpers/path");
const { fork } = require("../helpers/child-process");
const notify = require("../helpers/notify");

const { build } = require("./build");

/**
 * @param {string} file
 * @return {boolean}
 */
function test(file) {
  if (build(file)) {
    const child = fork(withExtension(file, ".js"), [], {
      stdio: "inherit",
      execArgv: [
        ...process.execArgv,
        "--require",
        require.resolve("../helpers/coverage")
      ]
    });

    if (child.status === 0) {
      return true;
    }

    notify.error(chalk.gray(file));
  }

  return false;
}

exports.test = test;
