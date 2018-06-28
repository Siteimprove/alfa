import * as fs from "fs";
import { Session, Profiler } from "inspector";

const [header] = require("module").wrapper;

const { min, max } = Math;

export interface Line {
  readonly value: string;
  readonly index: number;
  readonly start: number;
  readonly end: number;
}

export interface Location {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
}

export interface Range {
  readonly start: Location;
  readonly end: Location;
}

export const enum CoverageType {
  Function,
  Block
}

export interface Coverage {
  readonly type: CoverageType;
  readonly range: Range;
  readonly count: number;
}

export interface FunctionCoverage extends Coverage {
  readonly type: CoverageType.Function;
  readonly name: string;
}

export interface BlockCoverage extends Coverage {
  readonly type: CoverageType.Block;
}

export interface Script {
  readonly url: string;
  readonly lines: Array<Line>;
  readonly coverage: Array<FunctionCoverage | BlockCoverage>;
}

export function install() {
  const session = new Session();
  session.connect();

  session.post("Profiler.enable");
  session.post("Profiler.startPreciseCoverage", {
    callCount: true,
    detailed: true
  });

  process.on("exit", () => {
    session.post("Profiler.takePreciseCoverage", (err, { result }) => {
      if (err) {
        console.error(err.message);
      } else {
        for (const scriptCoverage of result) {
          const script = parseScript(scriptCoverage);

          if (script === null) {
            continue;
          }
        }
      }
    });
  });
}

function parseScript(scriptCoverage: Profiler.ScriptCoverage): Script | null {
  let source: string;
  try {
    source = fs.readFileSync(scriptCoverage.url, "utf8");
  } catch (err) {
    return null;
  }

  let offset = 0;

  const lines: Array<Line> = source.split("\n").map((value, index) => {
    const line: Line = {
      value,
      index,
      start: offset,
      end: offset + value.length
    };

    offset = line.end + 1;

    return line;
  });

  const coverage: Array<FunctionCoverage | BlockCoverage> = [];

  for (const functionCoverage of scriptCoverage.functions) {
    if (functionCoverage.functionName !== "") {
      // The first range will always be function granular if the coverage entry
      // contains a non-empty funtion name.
      const range = functionCoverage.ranges.shift();

      if (range === undefined) {
        continue;
      }

      coverage.push(parseFunctionCoverage(lines, functionCoverage, range));
    }

    for (const range of functionCoverage.ranges) {
      coverage.push(parseBlockCoverage(lines, functionCoverage, range));
    }
  }

  return {
    url: scriptCoverage.url,
    lines,
    coverage
  };
}

function parseFunctionCoverage(
  lines: Array<Line>,
  functionCoverage: Profiler.FunctionCoverage,
  coverageRange: Profiler.CoverageRange
): FunctionCoverage {
  const range = parseRange(lines, coverageRange);

  return {
    type: CoverageType.Function,
    range,
    count: coverageRange.count,
    name: functionCoverage.functionName
  };
}

function parseBlockCoverage(
  lines: Array<Line>,
  functionCoverage: Profiler.FunctionCoverage,
  coverageRange: Profiler.CoverageRange
): BlockCoverage {
  const range = parseRange(lines, coverageRange);

  return {
    type: CoverageType.Block,
    range,
    count: coverageRange.count
  };
}

function parseRange(lines: Array<Line>, range: Profiler.CoverageRange): Range {
  const first = lines[0];
  const last = lines[lines.length - 1];

  const start = max(first.start, range.startOffset - header.length);
  const end = min(last.end, range.endOffset - header.length);

  return {
    start: parseLocation(lines, start),
    end: parseLocation(lines, end)
  };
}

function parseLocation(lines: Array<Line>, offset: number): Location {
  const line = getLineAtOffset(lines, offset);

  return {
    offset,
    line: line.index,
    column: offset - line.start
  };
}

function getLineAtOffset(lines: Array<Line>, offset: number): Line {
  let lo = 0;
  let hi = lines.length - 2;

  while (lo < hi) {
    const mid = (lo + (hi - lo) / 2) | 0;

    if (offset < lines[mid].start) {
      hi = mid - 1;
    } else if (offset >= lines[mid + 1].start) {
      lo = mid + 1;
    } else {
      return lines[mid];
    }
  }

  return lines[lo];
}
