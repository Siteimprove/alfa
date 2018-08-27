const childProcess = require("child_process");

/**
 * @typedef {Object} ChildProcess
 * @property {number} pid
 * @property {string} stdout
 * @property {string} stderr
 * @property {number} status
 * @property {Error | null} error
 */

/**
 * @typedef {Object} SpawnOptions
 * @property {string} [stdio]
 */

/**
 * @typedef {Object} ForkOptions
 * @property {string} [stdio]
 * @property {string} [execPath]
 * @property {Array<string>} [execArgv]
 */

/**
 * @param {string} command
 * @param {Array<string>} args
 * @param {SpawnOptions} [options]
 * @return {ChildProcess}
 */
function spawn(command, args, options = {}) {
  const child = childProcess.spawnSync(command, args, {
    maxBuffer: 10000 * 1024,
    encoding: "utf8",
    stdio: options.stdio
  });

  child.stdout = trim(child.stdout);
  child.stderr = trim(child.stderr);

  return child;
}

exports.spawn = spawn;

/**
 * @param {string} module
 * @param {Array<string>} args
 * @param {ForkOptions} [options]
 * @return {ChildProcess}
 */
function fork(module, args, options = {}) {
  const {
    execPath = process.execPath,
    execArgv = process.execArgv,
    ...rest
  } = options;

  return spawn(execPath, execArgv.concat([module], args), rest);
}

exports.fork = fork;

/**
 * @param {string | null} input
 * @return {string}
 */
function trim(input) {
  if (input === null) {
    return "";
  }

  const last = input.length - 1;

  if (input[last] === "\n" || input[last] === "\r") {
    return input.slice(0, last);
  }

  return input;
}
