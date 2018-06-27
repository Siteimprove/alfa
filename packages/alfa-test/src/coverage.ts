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

export interface Script {
  readonly url: string;
  readonly source: string;
  readonly lines: Array<Line>;
  readonly coverage: Array<
    FunctionCoverage | BranchCoverage | StatementCoverage
  >;
}

export const enum CoverageType {
  Function,
  Branch,
  Statement
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

export interface BranchCoverage extends Coverage {
  readonly type: CoverageType.Branch;
}

export interface StatementCoverage extends Coverage {
  readonly type: CoverageType.Statement;
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
      offset
    };

    offset += value.length + 1;

    return line;
  });

  const coverage: Array<
    FunctionCoverage | BranchCoverage | StatementCoverage
  > = [];

  for (const functionCoverage of scriptCoverage.functions) {
    for (const coverageRange of functionCoverage.ranges) {
      const range = parseRange(lines, coverageRange);

      const section = lines.filter(line => {
        return range.start.line <= line.index && range.end.line >= line.index;
      });

      if (section.length === 0) {
        continue;
      }

      if (functionCoverage.isBlockCoverage) {
        coverage.push(
          parseBranchCoverage(lines, functionCoverage, coverageRange)
        );
      } else if (functionCoverage.functionName) {
        coverage.push(
          parseFunctionCoverage(lines, functionCoverage, coverageRange)
        );
      }

      for (const line of section) {
        if (
          range.start.offset <= line.offset &&
          range.end.offset >= line.offset + line.value.length
        ) {
          coverage.push(parseStatementCoverage(line, coverageRange));
        }
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

function parseStatementCoverage(
  line: Line,
  coverageRange: Profiler.CoverageRange
): StatementCoverage {
  return {
    type: CoverageType.Statement,
    range: {
      start: {
        offset: line.offset,
        line: line.index,
        column: 0
      },
      end: {
        offset: line.offset + line.value.length,
        line: line.index,
        column: line.value.length
      }
    },
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

function getLineAtOffset(lines: Array<Line>, offset: number): Line {
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
