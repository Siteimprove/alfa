import * as fs from "fs";
import * as path from "path";
import * as inspector from "inspector";
import { Session } from "inspector";
import * as sourceMap from "source-map";
import { SourceMapConsumer } from "source-map";

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
 * @property {string} path
 * @property {number} offset
 * @property {number} line
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
 * @typedef {Object} Source
 * @property {string} path
 * @property {string} content
 * @property {Array<Line>} lines
 */

/**
 * @typedef {Object} Script
 * @property {string} base
 * @property {Array<Source>} sources
 * @property {Array<FunctionCoverage | BlockCoverage>} coverage
 */

/**
 * @param {inspector.Profiler.ScriptCoverage} scriptCoverage
 * @return {Script | null}
 */
function parseScript({ url, functions }) {
  /** @type {Script} */
  const script = { base: path.dirname(url), sources: [], coverage: [] };

  /** @type {string} */
  let source;
  try {
    source = fs.readFileSync(url, "utf8");
  } catch (err) {
    return null;
  }

  /** @type {Array<Line>} */
  const lines = parseLines(source);

  script.sources.push({
    path: path.basename(url),
    content: source,
    lines
  });

  /** @type {SourceMapConsumer | null} */
  let map = null;
  try {
    /** @type {sourceMap.RawSourceMap} */
    const rawMap = JSON.parse(fs.readFileSync(`${url}.map`, "utf8"));

    for (const source of rawMap.sources) {
      const content = fs.readFileSync(
        path.resolve(script.base, source),
        "utf8"
      );

      script.sources.push({
        path: source,
        content,
        lines: parseLines(content)
      });
    }

    map = new SourceMapConsumer(rawMap);
  } catch (err) {}

  for (const coverage of functions) {
    const { functionName: name } = coverage;

    if (name !== "") {
      // The first range will always be function granular if the coverage entry
      // contains a non-empty funtion name. We therefore grab this coverage
      // range and store it as function coverage.
      const range = coverage.ranges.shift();

      if (range === undefined) {
        continue;
      }

      const parsed = parseFunctionCoverage(script, map, range, name);

      if (parsed !== null) {
        script.coverage.push(parsed);
      }
    }

    // For the remaining ranges, store them as block coverage. If detailed
    // coverage is disabled then no additional coverage ranges other than the
    // function granular range parsed above will be present.
    for (const range of coverage.ranges) {
      const parsed = parseBlockCoverage(script, map, range);

      if (parsed !== null) {
        script.coverage.push(parsed);
      }
    }
  }

  return script;
}

/**
 * @param {string} input
 * @return {Array<Line>}
 */
function parseLines(input) {
  let offset = 0;

  return input.split("\n").map((value, index) => {
    const line = {
      value,
      index,
      start: offset,
      end: offset + value.length
    };

    offset = line.end + 1;

    return line;
  });
}

/**
 * @param {Script} script
 * @param {SourceMapConsumer | null} map
 * @param {inspector.Profiler.CoverageRange} range
 * @param {string} name
 * @return {FunctionCoverage | null}
 */
function parseFunctionCoverage(script, map, range, name) {
  const parsed = parseRange(script, map, range);

  if (parsed === null) {
    return null;
  }

  return {
    range: parsed,
    count: range.count,
    name
  };
}

/**
 * @param {Script} script
 * @param {SourceMapConsumer | null} map
 * @param {inspector.Profiler.CoverageRange} range
 * @return {BlockCoverage | null}
 */
function parseBlockCoverage(script, map, range) {
  const parsed = parseRange(script, map, range, {
    trim: true
  });

  if (parsed === null) {
    return null;
  }

  return {
    range: parsed,
    count: range.count
  };
}

/**
 * @param {Script} script
 * @param {SourceMapConsumer | null} map
 * @param {inspector.Profiler.CoverageRange} range
 * @param {{ trim?: boolean }} [options]
 * @return {Range | null}
 */
function parseRange(script, map, range, options = {}) {
  const [{ content, lines }] = script.sources;

  const first = lines[0];
  const last = lines[lines.length - 1];

  let { startOffset, endOffset } = range;

  startOffset = max(first.start, startOffset - header.length);
  endOffset = min(last.end, endOffset - header.length);

  if (options.trim === true) {
    if (content[startOffset] === "{" && content[endOffset - 1] === "}") {
      startOffset--;
      endOffset--;
    }

    while (isWhitespace(content[startOffset])) {
      startOffset++;
    }

    while (isWhitespace(content[endOffset - 1])) {
      endOffset--;
    }
  }

  if (startOffset >= endOffset) {
    return null;
  }

  const start = getLocation(script, map, startOffset);
  const end = getLocation(script, map, endOffset);

  if (start === null || end === null || start.path !== end.path) {
    return null;
  }

  return {
    start,
    end
  };
}

/**
 * @param {Script} script
 * @param {SourceMapConsumer | null} map
 * @param {number} offset
 * @return {Location | null}
 */
function getLocation(script, map, offset) {
  const [{ path, lines }] = script.sources;

  const line = getLineAtOffset(lines, offset);

  if (map === null) {
    return {
      path,
      offset,
      line: line.index,
      column: offset - line.start
    };
  }

  return getOriginalLocation(script, map, offset, line);
}

/**
 * @param {Script} script
 * @param {SourceMapConsumer} map
 * @param {number} offset
 * @param {Line} line
 * @return {Location | null}
 */
function getOriginalLocation(script, map, offset, line) {
  const position = map.originalPositionFor({
    line: line.index + 1,
    column: offset - line.start
  });

  const source = script.sources.find(source => source.path === position.source);

  if (source === undefined) {
    return null;
  }

  const index = position.line - 1;

  return {
    path: source.path,
    offset: source.lines[index].start + position.column,
    line: index,
    column: position.column
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

/**
 * @param {string} input
 * @return {boolean}
 */
function isWhitespace(input) {
  return input === " " || input === "\t" || input === "\n" || input === "\r";
}
