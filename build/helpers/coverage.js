import * as fs from "fs";
import * as inspector from "inspector";
import { Session } from "inspector";

/**
 * @see https://nodejs.org/api/modules.html#modules_the_module_wrapper
 */
// @ts-ignore: This uses an internal API.
const [header] = require("module").wrapper;

const { min, max } = Math;

const session = new Session();

session.connect();

session.post("Profiler.enable");

session.post("Profiler.startPreciseCoverage", {
  callCount: true,
  detailed: true
});

process.on("exit", () => {
  session.post("Profiler.takePreciseCoverage", (err, { result }) => {
    for (const scriptCoverage of result) {
      if (!fs.existsSync(scriptCoverage.url)) {
        continue;
      }

      if (scriptCoverage.url === __filename) {
        continue;
      }

      parseScript(scriptCoverage);
    }
  });
});

/**
 * @typedef {Object} Line
 * @property {string} value
 * @property {number} index
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} Location
 * @property {number} offset
 * @property {Line} line
 * @property {number} column
 */

/**
 * @typedef {Object} Range
 * @property {Location} start
 * @property {Location} end
 */

/**
 * @typedef {Object} FunctionCoverage
 * @property {Range} range
 * @property {number} count
 * @property {string} name
 */

/**
 * @typedef {Object} BlockCoverage
 * @property {Range} range
 * @property {number} count
 */

/**
 * @typedef {Object} Script
 * @property {string} url
 * @property {string} source
 * @property {Array<Line>} lines
 * @property {Array<FunctionCoverage | BlockCoverage>} coverage
 */

/**
 * @param {inspector.Profiler.ScriptCoverage} scriptCoverage
 * @return {Script}
 */
function parseScript(scriptCoverage) {
  const source = fs.readFileSync(scriptCoverage.url, "utf8");

  let offset = 0;

  /** @type {Array<Line>} */
  const lines = source.split("\n").map((value, index) => {
    const line = {
      value,
      index,
      start: offset,
      end: offset + value.length
    };

    offset = line.end + 1;

    return line;
  });

  /** @type {Array<FunctionCoverage | BlockCoverage>} */
  const coverage = [];

  for (const functionCoverage of scriptCoverage.functions) {
    const { functionName: name } = functionCoverage;

    if (name !== "") {
      // The first range will always be function granular if the coverage entry
      // contains a non-empty funtion name. We therefore grab this coverage
      // range and store it as function coverage.
      const coverageRange = functionCoverage.ranges.shift();

      if (coverageRange === undefined) {
        continue;
      }

      const parsed = parseFunctionCoverage(lines, source, coverageRange, name);

      if (parsed !== null) {
        coverage.push(parsed);
      }
    }

    // For the remaining ranges, store them as block coverage. If detailed
    // coverage is disabled then no additional coverage ranges other than the
    // function granular range parsed above will be present.
    for (const coverageRange of functionCoverage.ranges) {
      const parsed = parseBlockCoverage(lines, source, coverageRange);

      if (parsed !== null) {
        coverage.push(parsed);
      }
    }
  }

  return {
    url: scriptCoverage.url,
    source,
    lines,
    coverage
  };
}

/**
 * @param {Array<Line>} lines
 * @param {string} source
 * @param {inspector.Profiler.CoverageRange} coverageRange
 * @param {string} name
 * @return {FunctionCoverage | null}
 */
function parseFunctionCoverage(lines, source, coverageRange, name) {
  const range = parseRange(lines, source, coverageRange);

  if (range === null) {
    return null;
  }

  return {
    range,
    count: coverageRange.count,
    name
  };
}

/**
 * @param {Array<Line>} lines
 * @param {string} source
 * @param {inspector.Profiler.CoverageRange} coverageRange
 * @return {BlockCoverage | null}
 */
function parseBlockCoverage(lines, source, coverageRange) {
  const range = parseRange(lines, source, coverageRange, { trim: true });

  if (range === null) {
    return null;
  }

  return {
    range,
    count: coverageRange.count
  };
}

/**
 * @param {Array<Line>} lines
 * @param {string} source
 * @param {inspector.Profiler.CoverageRange} coverageRange
 * @param {{ trim?: boolean }} [options]
 * @return {Range | null}
 */
function parseRange(lines, source, coverageRange, options = {}) {
  const first = lines[0];
  const last = lines[lines.length - 1];

  let { startOffset: start, endOffset: end } = coverageRange;

  start = max(first.start, start - header.length);
  end = min(last.end, end - header.length);

  if (options.trim === true) {
    if (isBlockBorder(source[start])) {
      start++;
    }

    if (isBlockBorder(source[end - 1])) {
      end--;
    }

    while (isWhitespace(source[start])) {
      start++;
    }

    while (isWhitespace(source[end - 1])) {
      end--;
    }
  }

  if (start >= end) {
    return null;
  }

  return {
    start: getLocation(lines, start),
    end: getLocation(lines, end)
  };
}

/**
 * @param {Array<Line>} lines
 * @param {number} offset
 * @return {Location}
 */
function getLocation(lines, offset) {
  const line = getLineAtOffset(lines, offset);

  return {
    offset,
    line,
    column: offset - line.start
  };
}

/**
 * @param {Array<Line>} lines
 * @param {number} offset
 * @return {Line}
 */
function getLineAtOffset(lines, offset) {
  let lower = 0;
  let upper = lines.length - 2;

  while (lower < upper) {
    const middle = (lower + (upper - lower) / 2) | 0;

    if (offset < lines[middle].start) {
      upper = middle - 1;
    } else if (offset >= lines[middle + 1].start) {
      lower = middle + 1;
    } else {
      lower = middle;
      break;
    }
  }

  return lines[lower];
}

const whitespace = /\s/;

/**
 * @param {string} input
 * @return {boolean}
 */
function isWhitespace(input) {
  return whitespace.test(input);
}

/**
 * @param {string} input
 * @return {boolean}
 */
function isBlockBorder(input) {
  return input === "{" || input === "}";
}
