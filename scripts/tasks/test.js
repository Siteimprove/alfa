const chalk = require("chalk");

const { withExtension } = require("../helpers/path");
const { fork } = require("../helpers/child-process");
const notify = require("../helpers/notify");

const flags = [
  ...["--require", require.resolve("source-map-support/register")]
];

/**
 * @param {string} file
 * @return {boolean}
 */
function test(file) {
  const child = fork(withExtension(file, ".js"), [], {
    stdio: "inherit",
    execArgv: [...process.execArgv, ...flags]
  });

  if (child.status === 0) {
    return true;
  }

  notify.error(chalk.gray(file));

  return false;
}

exports.test = test;
