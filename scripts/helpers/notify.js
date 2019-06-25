const util = require("util");
const readline = require("readline");
const { default: chalk } = require("chalk");

const stream = process.stdout;

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
 * @param {string} format
 * @param {...any} args
 */
function pending(format, ...args) {
  log(chalk.magenta, "\u2026", "pending", format, ...args);
}

exports.pending = pending;

/**
 * @return {void}
 */
function replace() {
  readline.moveCursor(stream, 0, -1);
  readline.clearLine(stream, 0);
  readline.cursorTo(stream, 0);
}

exports.replace = replace;

/**
 * @param {typeof chalk} color
 * @param {string} symbol
 * @param {string} title
 * @param {string} format
 * @param {...string} args
 */
function log(color, symbol, title, format, ...args) {
  let output = chalk.gray(`[${timestamp()}] \u203a`);

  output += " ";

  output += color(`${symbol}  ${chalk.underline(title)}`);

  output += repeat(" ", 10 - title.length);

  output += util.format(format, ...args);

  stream.write(`${output}\n`);
}

/**
 * @return {string}
 */
function timestamp() {
  return new Date().toLocaleTimeString();
}

/**
 * @param {string} input
 * @param {number} times
 * @return {string}
 */
function repeat(input, times) {
  let output = "";

  while (times-- > 0) {
    output += input;
  }

  return output;
}
