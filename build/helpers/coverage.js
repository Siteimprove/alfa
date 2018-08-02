import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as inspector from "inspector";
import * as notify from "./notify";
import {
  byteLengthTotalCoverage,
  byteLengthBlockCoverage
} from "./coverage-heuristics/byte";
import {
  logicalTotalCoverage,
  logicalBlockCoverage
} from "./coverage-heuristics/logical";
import {
  arithmeticTotalCoverage,
  arithmeticBlockCoverage
} from "./coverage-heuristics/arithmetic";
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

const heuristics = [
  {
    heuristicTotal: byteLengthTotalCoverage,
    heuristicBlock: byteLengthBlockCoverage,
    weight: 0.1
  },
  {
    heuristicTotal: arithmeticTotalCoverage,
    heuristicBlock: arithmeticBlockCoverage,
    weight: 0.1
  },
  {
    heuristicTotal: logicalTotalCoverage,
    heuristicBlock: logicalBlockCoverage,
    weight: 0.8
  }
];

session.connect();

session.post("Profiler.enable");

session.post("Profiler.startPreciseCoverage", {
  callCount: true,
  detailed: true
});

process.on("exit", () => {
  session.post("Profiler.takePreciseCoverage", (err, { result }) => {
    const spec = process.argv[1];
    const impl = spec
      .replace(`${path.sep}test${path.sep}`, `${path.sep}src${path.sep}`)
      .replace(".spec.js", ".js");

    for (const scriptCoverage of result) {
      if (scriptCoverage.url === __filename) {
        continue;
      }

      if (scriptCoverage.url !== impl) {
        continue;
      }
      const script = parseScript(scriptCoverage);

      if (script === null) {
        continue;
      }

      let sortedBlocks = script.coverage.sort(function(a, b) {
        if (a.points < b.points) {
          return 1;
        }

        if (a.points > b.points) {
          return -1;
        }

        return 0;
      });

      printCoverageStatistics(script);
      if (
        sortedBlocks.length > 0 &&
        process.env.npm_lifecycle_event === "start"
      ) {
        printCoverage(script, sortedBlocks[0]);
      }
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
 * @property {number} points
 * @property {string} name
 */

/**
 * @typedef {Object} BlockCoverage
 * @property {Range} range
 * @property {number} count
 * @property {number} points
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

  let block = {
    range: parsed,
    count: range.count,
    points: 0,
    name
  };

  if (block.count !== 0) {
    return block;
  }

  block.points = calculateBlockCoverage(script, block);
  return block;
}

/**
 * @param {Script} script
 * @param {SourceMapConsumer | null} map
 * @param {inspector.Profiler.CoverageRange} range
 * @return {BlockCoverage | null}
 */
function parseBlockCoverage(script, map, range) {
  let parsed = parseRange(script, map, range, {
    trim: true
  });

  if (parsed === null) {
    parsed = parseRange(script, map, range);
  }

  if (parsed === null) {
    return null;
  }

  let block = {
    range: parsed,
    count: range.count,
    points: 0
  };

  if (block.count !== 0) {
    return block;
  }

  block.points = calculateBlockCoverage(script, block);
  return block;
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
    while (
      isBlockBorder(content[startOffset]) ||
      isWhitespace(content[startOffset])
    ) {
      startOffset++;
    }

    while (
      isBlockBorder(content[endOffset - 1]) ||
      isWhitespace(content[endOffset - 1])
    ) {
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
function isBlockBorder(input) {
  return input === "{" || input === "}";
}

/**
 * @param {string} input
 * @return {boolean}
 */
function isWhitespace(input) {
  return input === " " || input === "\t" || input === "\n" || input === "\r";
}

/**
 * @param {Script} script
 */
function printCoverageStatistics(script) {
  let file = "";
  if (script.sources.length === 1) {
    file += " in " + script.sources[0].path;
  } else if (script.sources.length === 2) {
    file += " in " + script.sources[1].path;
  }
  const total = calculateTotalCoverage(script);
  if (total < 90) {
    notify.warn(`Low coverage (${total.toFixed(2)}%)` + file);
  }
}

/**
 * @param {Script} script
 * @param {FunctionCoverage | BlockCoverage} coverage
 */
function printCoverage(script, coverage) {
  // Skip all blocks that are covered at least once.
  if (coverage.count !== 0) {
    return;
  }

  const { start, end } = coverage.range;

  const source = script.sources.find(source => source.path === start.path);

  if (source === undefined) {
    return;
  }

  const uncovered = source.content.substring(start.offset, end.offset);

  const filePath = path.relative(
    process.cwd(),
    path.resolve(script.base, source.path)
  );

  const above = `${source.lines[start.line - 1].value}`;
  const below = `${source.lines[end.line + 1].value}`;

  const before = source.lines[start.line].value.slice(0, start.column);
  const after = source.lines[end.line].value.slice(end.column);

  let output = `${chalk.bold("Suggested Block to Cover")}`;

  output += `\n${chalk.dim(`${filePath}:${start.line + 1}-${end.line + 1}`)}`;
  output += "\n";

  output += above.trim() === "" ? "" : `\n${above}`;
  output += `\n${before}`;

  output += `${chalk.bold.red(uncovered)}`;

  output += `${after}\n`;
  output += below.trim() === "" ? "" : `${below}\n`;

  process.stdout.write(`\n${output}\n`);
}

/**
 * @param {Script} script
 */
function calculateTotalCoverage(script) {
  let points = 0;
  for (let i = 0, n = heuristics.length; i < n; i++) {
    points += heuristics[i].heuristicTotal(script) * heuristics[i].weight;
  }
  return points;
}

/**
 * @param {Script} script
 * @param {FunctionCoverage | BlockCoverage} block
 */
function calculateBlockCoverage(script, block) {
  let points = 0;
  for (let i = 0, n = heuristics.length; i < n; i++) {
    points +=
      heuristics[i].heuristicBlock(script, block) * heuristics[i].weight;
  }
  return points;
}
