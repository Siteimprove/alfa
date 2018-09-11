/// <reference path="../types/pretty-ms.d.ts" />

const prettyMs = require("pretty-ms");
const { default: chalk } = require("chalk");

/**
 * @typedef {number} Time
 */

/**
 * @param {Time} [time]
 * @return {Time}
 */
function now(time = 0) {
  return Date.now() - time;
}

exports.now = now;

/**
 * @param {Time} time
 * @param {{ color?: "red" | "green" | "blue" | "yellow", threshold?: number }} options
 * @return {string}
 */
function format(time, options = {}) {
  if (options.threshold !== undefined && time < options.threshold) {
    return "";
  }

  const formatted = prettyMs(time);

  if (options.color !== undefined) {
    return chalk[options.color](formatted);
  }

  return formatted;
}

exports.format = format;
