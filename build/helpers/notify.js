import * as util from "util";
import chalk from "chalk";

/**
 * @param {string} format
 * @param {...any} args
 */
export function success(format, ...args) {
  log(chalk.green, "\u2714", "success", format, ...args);
}

/**
 * @param {string} format
 * @param {...any} args
 */
export function error(format, ...args) {
  log(chalk.red, "\u2716", "error", format, ...args);
}

/**
 * @param {string} format
 * @param {...any} args
 */
export function warn(format, ...args) {
  log(chalk.yellow, "\u26a0", "warning", format, ...args);
}

/**
 * @param {string} format
 * @param {...any} args
 */
export function skip(format, ...args) {
  log(chalk.gray, "\u2026", "skipped", format, ...args);
}

/**
 * @param {string} format
 * @param {...any} args
 */
export function watch(format, ...args) {
  log(chalk.yellow, "\u2026", "watching", format, ...args);
}

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
