// @ts-check

const path = require("path");
const chalk = require("chalk");

const { withExtension } = require("../helpers/path");
const { notify } = require("../helpers/notify");
const { spawn } = require("../helpers/child-process");

const { build } = require("./build");

function test(file) {
  if (build(file)) {
    const child = spawn("node", ["-r", "esm", withExtension(file, ".js")], {
      stdio: "inherit"
    });

    if (child.status === 0) {
      return true;
    }

    notify.error(chalk.dim(file));
  }

  return false;
}

module.exports = { test };
