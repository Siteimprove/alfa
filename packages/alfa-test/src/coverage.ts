import { Profiler, Session } from "inspector";

export interface Line {
  readonly value: string;
  readonly index: number;
  readonly start: number;
  readonly end: number;
}

export interface Location {
  readonly offset: number;
  readonly line: Line;
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

  session.post("Debugger.enable");
  session.post("Profiler.enable");

  session.post("Profiler.startPreciseCoverage", {
    callCount: true,
    detailed: true
  });

  process.on("exit", () => {
    session.post("Profiler.takePreciseCoverage", (err, { result }) => {
      if (err !== null) {
        process.stderr.write(`${err.message}\n`);
        return;
      }

      for (const scriptCoverage of result) {
        const { scriptId } = scriptCoverage;

        session.post(
          "Debugger.getScriptSource",
          { scriptId },
          (err, { scriptSource }) => {
            if (err !== null) {
              process.stderr.write(`${err.message}\n`);
              return;
            }

            parseScript(scriptCoverage, scriptSource);
          }
        );
      }
    });
  });
}

function parseScript(
  scriptCoverage: Profiler.ScriptCoverage,
  scriptSource: string
): Script {
  let offset = 0;

  const lines: Array<Line> = scriptSource.split("\n").map((value, index) => {
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
    const { functionName: name } = functionCoverage;

    if (name !== "") {
      // The first range will always be function granular if the coverage entry
      // contains a non-empty funtion name. We therefore grab this coverage
      // range and store it as function coverage.
      const range = functionCoverage.ranges.shift();

      if (range === undefined) {
        continue;
      }

      coverage.push(parseFunctionCoverage(lines, range, name));
    }

    // For the remaining ranges, store them as block coverage. If detailed
    // coverage is disabled then no additional coverage ranges other than the
    // function granular range parsed above will be present.
    for (const range of functionCoverage.ranges) {
      coverage.push(parseBlockCoverage(lines, range));
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
  coverageRange: Profiler.CoverageRange,
  name: string
): FunctionCoverage {
  const range = parseRange(lines, coverageRange);

  return {
    type: CoverageType.Function,
    range,
    count: coverageRange.count,
    name
  };
}

function parseBlockCoverage(
  lines: Array<Line>,
  coverageRange: Profiler.CoverageRange
): BlockCoverage {
  const range = parseRange(lines, coverageRange);

  return {
    type: CoverageType.Block,
    range,
    count: coverageRange.count
  };
}

function parseRange(
  lines: Array<Line>,
  coverageRange: Profiler.CoverageRange
): Range {
  const { startOffset, endOffset } = coverageRange;

  return {
    start: parseLocation(lines, startOffset),
    end: parseLocation(lines, endOffset)
  };
}

function parseLocation(lines: Array<Line>, offset: number): Location {
  const line = getLineAtOffset(lines, offset);

  return {
    offset,
    line,
    column: offset - line.start
  };
}

function getLineAtOffset(lines: Array<Line>, offset: number): Line {
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
