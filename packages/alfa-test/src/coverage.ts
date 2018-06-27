import * as fs from "fs";
import { Session, Profiler } from "inspector";

const [header] = require("module").wrapper;

export interface Line {
  readonly value: string;
  readonly index: number;
  readonly offset: number;
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

export interface ScriptCoverage {
  readonly source: string;
  readonly lines: Array<Line>;
  readonly coverage: Array<FunctionCoverage | BranchCoverage>;
}

export const enum CoverageType {
  Function,
  Branch
}

export interface FunctionCoverage {
  readonly type: CoverageType.Function;
  readonly range: Range;
  readonly count: number;
}

export interface BranchCoverage {
  readonly type: CoverageType.Branch;
  readonly range: Range;
  readonly count: number;
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
          parseScriptCoverage(scriptCoverage);
        }
      }
    });
  });
}

function parseScriptCoverage(
  scriptCoverage: Profiler.ScriptCoverage
): ScriptCoverage | null {
  let source: string;
  try {
    source = fs.readFileSync(scriptCoverage.url, "utf8");
  } catch (err) {
    return null;
  }

  let offset = 0;

  const lines: Array<Line> = source.split("\n").map((value, i) => {
    const line: Line = {
      value,
      index: i + 1,
      offset
    };

    offset += value.length + 1;

    return line;
  });

  const coverage: Array<FunctionCoverage | BranchCoverage> = [];

  for (const functionCoverage of scriptCoverage.functions) {
    for (const coverageRange of functionCoverage.ranges) {
      if (functionCoverage.isBlockCoverage) {
        coverage.push(
          parseBranchCoverage(lines, functionCoverage, coverageRange)
        );
      } else {
        coverage.push(
          parseFunctionCoverage(lines, functionCoverage, coverageRange)
        );
      }
    }
  }

  return { source, lines, coverage };
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
    count: coverageRange.count
  };
}

function parseBranchCoverage(
  lines: Array<Line>,
  functionCoverage: Profiler.FunctionCoverage,
  coverageRange: Profiler.CoverageRange
): BranchCoverage {
  const range = parseRange(lines, coverageRange);

  return {
    type: CoverageType.Branch,
    range,
    count: coverageRange.count
  };
}

function parseRange(lines: Array<Line>, range: Profiler.CoverageRange): Range {
  const start = range.startOffset - header.length;
  const end = range.endOffset - header.length;

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
    column: offset - line.offset
  };
}

export function getLineAtOffset(lines: Array<Line>, offset: number): Line {
  let lo = 0;
  let hi = lines.length - 2;

  while (lo < hi) {
    const mid = (lo + (hi - lo) / 2) | 0;

    if (offset < lines[mid].offset) {
      hi = mid - 1;
    } else if (offset >= lines[mid + 1].offset) {
      lo = mid + 1;
    } else {
      return lines[mid];
    }
  }

  return lines[lo];
}
