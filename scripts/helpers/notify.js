const util = require("util");
const { default: chalk } = require("chalk");

/**
 * @param {string} format
 * @param {...any} args
 */
function success(format, ...args) {
  log(chalk.green, "\u2714", "success", format, ...args);
}

exports.success = success;

/**
 * @param {string} format
 * @param {...any} args
 */
function error(format, ...args) {
  log(chalk.red, "\u2716", "error", format, ...args);
}

exports.error = error;

/**
 * @param {string} format
 * @param {...any} args
 */
function warn(format, ...args) {
  log(chalk.yellow, "\u26a0", "warning", format, ...args);
}

exports.warn = warn;

/**
 * @param {string} format
 * @param {...any} args
 */
function skip(format, ...args) {
  log(chalk.gray, "\u2026", "skipped", format, ...args);
}

exports.skip = skip;

/**
 * @param {string} format
 * @param {...any} args
 */
function watch(format, ...args) {
  log(chalk.yellow, "\u2026", "watching", format, ...args);
}

exports.watch = watch;

/**
 * @param {typeof chalk} color
 * @param {string} symbol
 * @param {string} title
 * @param {string} format
 * @param {...string} args
 */
function log(color, symbol, title, format, ...args) {
  let output = chalk.gray(`[${timestamp()}] \u203a `);

  output += color(`${symbol}  ${chalk.underline(pad(title, 8))} `);
  output += util.format(format, ...args);

  process.stdout.write(`${output}\n`);
}

/**
 * @return {string}
 */
function timestamp() {
  return new Date().toLocaleTimeString();
}

/**
 * @param {string} input
 * @param {number} length
 * @param {string} [character]
 * @return {string}
 */
function pad(input, length, character = " ") {
  while (input.length < length) {
    input += character;
  }

  return input;
}
