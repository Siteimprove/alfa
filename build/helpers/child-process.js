import * as childProcess from "child_process";

/**
 * @param {string} command
 * @param {Array<string>} args
 * @param {childProcess.SpawnSyncOptions} [options]
 * @return {childProcess.SpawnSyncReturns<string>}
 */
export function spawn(command, args, options = {}) {
  const child = childProcess.spawnSync(command, args, {
    maxBuffer: 10000 * 1024,
    encoding: "utf8",
    stdio: options.stdio
  });

  child.stdout = trim(child.stdout);
  child.stderr = trim(child.stderr);

  return child;
}

/**
 * @param {string} module
 * @param {Array<string>} args
 * @param {childProcess.SpawnSyncOptions} [options]
 * @return {childProcess.SpawnSyncReturns<string>}
 */
export function fork(module, args, options = {}) {
  return spawn(
    process.execPath,
    process.execArgv.concat([module], args),
    options
  );
}

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
