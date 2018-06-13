// @ts-check

const childProcess = require("child_process");

/**
 * @param {string} command
 * @param {Array<string>} args
 * @return {object}
 */
function spawn(command, args, options = {}) {
  options = Object.assign(
    {},
    {
      maxBuffer: 10000 * 1024,
      encoding: "utf8"
    },
    options
  );

  const child = childProcess.spawnSync(command, args, options);

  for (const pipe of ["stdout", "stderr"]) {
    const output = child[pipe];

    if (output !== null) {
      const last = output.length - 1;

      if (output[last] === "\n" || output[last] === "\r") {
        child[pipe] = output.substring(0, last);
      }
    }
  }

  return child;
}

module.exports = { spawn };
