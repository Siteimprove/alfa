const { default: chalk } = require("chalk");
const fs = require("fs");
const path = require("path");
const inspector = require("inspector");
const { Session } = require("inspector");
const sourceMap = require("source-map");
const { SourceMapConsumer } = require("source-map");

const notify = require("./notify");

const { Byte } = require("./metrics/byte");
const { Logical } = require("./metrics/logical");
const { Arithmetic } = require("./metrics/arithmetic");

/**
 * @see https://nodejs.org/api/modules.html#modules_the_module_wrapper
 */
// @ts-ignore: This uses an internal API.
const [header] = require("module").wrapper;

const { min, max } = Math;

const session = new Session();

const metrics = [
  {
    ...Arithmetic,
    weight: 1 / 3
  },
  {
    ...Byte,
    weight: 1 / 3
  },
  {
    ...Logical,
    weight: 1 / 3
  }
];

session.connect();

session.post("Profiler.enable");

session.post("Profiler.startPreciseCoverage", {
  callCount: true,
  detailed: true
});

process.on("beforeExit", code => {
  if (code !== 0) {
    return;
  }

  session.post("Profiler.takePreciseCoverage", async (err, { result }) => {
    const spec = process.argv[1];

    const dir = path
      .dirname(spec)
      .split(path.sep)
      .map(part => (part === "test" ? "src" : part))
      .join(path.sep);

    const impl = path.join(dir, `${path.basename(spec, ".spec.js")}.js`);

    for (const scriptCoverage of result) {
      if (scriptCoverage.url !== impl) {
        continue;
      }

      const script = await parseScript(scriptCoverage);

      if (script === null) {
        continue;
      }

      const total = calculateTotalCoverage(script);

      const blocks = new Map();

      for (const block of script.coverage) {
        blocks.set(block, calculateBlockCoverage(script, block, total));
      }

      const uncovered = script.coverage
        .filter(block => block.count === 0)
        .sort((a, b) => {
          const ap = blocks.get(a);
          const bp = blocks.get(b);

          return (bp === undefined ? 0 : bp) - (ap === undefined ? 0 : ap);
        });

      if (uncovered.length > 0 && process.env.npm_lifecycle_event === "start") {
        process.stdout.write(chalk.bold("\nSuggested blocks to cover\n"));

        const source = script.sources.find(
          source => source.path === uncovered[0].range.start.path
        );

        if (source === undefined) {
          return;
        }

        const filePath = path.relative(
          process.cwd(),
          path.resolve(script.base, source.path)
        );

        process.stdout.write(chalk.underline(`${filePath}\n`));

        // We can fill out the whole height of the terminal
        // If we don't know the height, fall back to 24.
        const space = process.stdout.rows ? process.stdout.rows : 24;
        let lineSum = 5;
        let blockCount = 0;

        for (const block of uncovered) {
          // Buffer added for dots and spacing
          lineSum += block.range.end.line - block.range.start.line + 5;

          // At least one block has to be printed
          if (lineSum > space && blockCount > 0) {
            break; // If the next block is going to fill more than the height
          }

          blockCount++;
        }

        const selectedBlocks = uncovered.slice(0, blockCount).sort((a, b) => {
          return a.range.start.line - b.range.start.line;
        });

        const widths = {
          // Make the gutter width as wide as the line number of the last line.
          // Since line counts are 1-indexed and an additional line may be added
          // to the output, we bump the line count twice to make sure the gutter
          // is wide enough.
          gutter: `${selectedBlocks[selectedBlocks.length - 1].range.end.line +
            2}`.length
        };

        for (let i = 0; blockCount > i; i++) {
          if (i !== 0) {
            process.stdout.write(chalk.blue(`${"\u00b7".repeat(3)}\n`));
          }

          printBlockCoverage(script, selectedBlocks[i], widths);
        }
      }

      printCoverageStatistics(script, total);
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
 * @return {Promise<Script | null>}
 */
async function parseScript({ url, functions }) {
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

  /** @type {sourceMap.SourceMapConsumer | null} */
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

    map = await new SourceMapConsumer(rawMap);
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

  if (map !== null) {
    map.destroy();
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
 * @param {sourceMap.SourceMapConsumer | null} map
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
 * @param {sourceMap.SourceMapConsumer | null} map
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

  return {
    range: parsed,
    count: range.count
  };
}

/**
 * @param {Script} script
 * @param {sourceMap.SourceMapConsumer | null} map
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

  const uncovered = content.substring(startOffset, endOffset).trim();

  if (isBlockBorder(uncovered) || uncovered === "") {
    return null;
  }

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
 * @param {sourceMap.SourceMapConsumer | null} map
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
 * @param {sourceMap.SourceMapConsumer} map
 * @param {number} offset
 * @param {Line} line
 * @return {Location | null}
 */
function getOriginalLocation(script, map, offset, line) {
  const position = map.originalPositionFor({
    line: line.index + 1,
    column: offset - line.start
  });

  if (
    position.source === null ||
    position.line === null ||
    position.column === null
  ) {
    return null;
  }

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
 * @param {number} total
 */
function printCoverageStatistics(script, total) {
  let source;

  switch (script.sources.length) {
    case 1:
      source = script.sources[0];
      break;
    case 2:
      source = script.sources[1];
      break;
    default:
      return;
  }

  const filePath = path.relative(
    process.cwd(),
    path.resolve(script.base, source.path)
  );

  if (total < 90) {
    notify.warn(`${chalk.dim(filePath)} Low coverage (${total.toFixed(2)}%)`);
  }
}

/**
 * @param {Script} script
 * @param {FunctionCoverage | BlockCoverage} coverage
 * @param {{ gutter: number }} widths
 */
function printBlockCoverage(script, coverage, widths) {
  const { start, end } = coverage.range;

  const source = script.sources.find(source => source.path === start.path);

  if (source === undefined) {
    return;
  }

  let uncovered = source.content
    .substring(start.offset, end.offset)
    .replace(/[^\s]+/g, word => chalk.red(word));

  const above = `${source.lines[start.line - 1].value}`;
  const below = `${source.lines[end.line + 1].value}`;

  const before = source.lines[start.line].value.slice(0, start.column);
  const after = source.lines[end.line].value.slice(end.column);

  let output = "";
  let offset = start.line;

  if (above.trim() !== "") {
    output += `${above}\n`;

    // Decrement the offset as we've added an additional line.
    offset--;
  }

  output += `${before}${uncovered}${after}`;

  if (below.trim() !== "") {
    output += `\n${below}`;
  }

  let lines = output.split("\n");
  const shownLines = 3;

  const len = lines.length;
  const isTruncating = len > shownLines * 2;
  if (isTruncating) {
    lines = lines.filter(
      (line, index) => index < shownLines || index > len - (shownLines + 1)
    );
  }

  output = lines
    .map((line, i) => {
      const actualIndex = i < shownLines ? i : len - 8 + i;
      const lineNo = (offset + actualIndex + 1).toString();

      const padding = {
        gutter: " ".repeat(widths.gutter - lineNo.length)
      };

      line = line.replace(/\s/g, whitespace => {
        switch (whitespace) {
          case " ":
            return chalk.gray.dim("\u00b7");
          case "\t":
            return chalk.gray.dim("\u00bb");
        }

        return whitespace;
      });

      const eol = chalk.gray.dim("\u00ac");

      return `${padding.gutter}${chalk.grey(lineNo)} ${line}${eol}`;
    })
    .join("\n");

  process.stdout.write(`\n${output}\n\n`);
}

/**
 * @param {Script} script
 * @return {number}
 */
function calculateTotalCoverage(script) {
  return metrics.reduce((coverage, metric) => {
    return coverage + metric.total(script) * metric.weight;
  }, 0);
}

/**
 * @param {Script} script
 * @param {FunctionCoverage | BlockCoverage} block
 * @param {number} total
 * @return {number}
 */
function calculateBlockCoverage(script, block, total) {
  return metrics.reduce((coverage, metric) => {
    return coverage + metric.block(script, block, total) * metric.weight;
  }, 0);
}
