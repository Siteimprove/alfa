import * as childProcess from "child_process";

/**
 * @param {string} command
 * @param {Array<string>} args
 * @return {object}
 */
export function spawn(command, args, options = {}) {
  options = Object.assign(
    {},
    {
      maxBuffer: 10000 * 1024,
      encoding: "utf8"
    },
    options
  );

  const child = childProcess.spawnSync(command, args, options);

  child.stdout = trim(child.stdout);
  child.stderr = trim(child.stderr);

  return child;
}

/**
 * @param {Buffer} input
 * @return {Buffer}
 */
function trim(input) {
  const last = input.length - 1;

  if (
    input[last] === "\n".charCodeAt(0) ||
    input[last] === "\r".charCodeAt(0)
  ) {
    return input.slice(0, last);
  }

  return input;
}
