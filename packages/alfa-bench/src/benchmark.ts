import { Event, Stats, Suite as BenchmarkSuite } from "benchmark";
import chalk from "chalk";

interface Target {
  readonly name: string;
  readonly hz: number;
  readonly stats: Stats;
  readonly error?: Error;
}

/**
 * @internal
 */
export interface Result {
  readonly title: string;
  readonly frequency: number;
  readonly margin: number;
  readonly samples: number;
}

/**
 * @internal
 */
export interface Notifier {
  error: (message: string) => void;
}

/**
 * @internal
 */
export interface Notifier {
  out: (message: string) => void;
}

/**
 * @internal
 */
const defaultNotifier: Notifier = {
  out: message => {
    process.stderr.write(`${message}\n`);
  }
};

/**
 * @internal
 */
export interface Suite extends Benchmark {
  on(title: string, handler: (event: Event) => void): void;
}

export interface Benchmark {
  add(title: string, callback: () => void | Promise<void>): Benchmark;
  run(): void;
}

export function benchmark(
  suite: Suite = new BenchmarkSuite(),
  results: Array<Result> = new Array<Result>(),
  notifier = defaultNotifier
): Benchmark {
  suite.on("cycle", ({ target }: Event) => {
    const { error, hz, name, stats } = target as Target;

    if (error !== undefined) {
      return;
    }

    results.push({
      title: name,
      frequency: round(hz, hz < 100 ? 2 : 0),
      margin: round(stats.rme, 2),
      samples: stats.sample.length
    });
  });

  suite.on("complete", () => {
    if (results.length === 0) {
      return;
    }

    const fastest = results.reduce(
      (fastest, result) =>
        result.frequency > fastest.frequency ? result : fastest
    );

    const longest = results.reduce(
      (longest, result) =>
        result.title.length > longest.title.length ? result : longest
    );

    let output = chalk.blue(results.length.toString());

    output += ` ${results.length === 1 ? "test" : "tests"} completed`;

    for (let i = 0, n = results.length; i < n; i++) {
      const char = i === results.length - 1 ? "\u2514" : "\u251c";

      output += `\n${chalk.gray(char)} ${format(results[i], fastest, longest)}`;
    }

    notifier.out(`${output}\n`);
  });

  return suite;
}

function round(number: number, digits: number): number {
  const power = Math.pow(10, digits);
  return Math.round(number * power) / power;
}

function repeat(times: number, string = " "): string {
  let output = "";

  while (times-- > 0) {
    output += string;
  }

  return output;
}

function length(input: string | number): number {
  return typeof input === "string"
    ? input.length
    : input.toLocaleString().length;
}

function format(result: Result, fastest: Result, longest: Result): string {
  const { title, frequency, margin, samples } = result;

  let output = result === fastest ? chalk.green.underline(title) : title;

  output += repeat(length(longest.title) - length(title));

  output += chalk.gray(" x ");

  output += repeat(length(fastest.frequency) - length(frequency));

  const percent = frequency / fastest.frequency;

  output += (percent > 0.95
    ? chalk.green
    : percent > 0.8
      ? chalk.yellow
      : chalk.red)(
    frequency.toLocaleString("en", {
      style: "decimal",
      useGrouping: true
    })
  );

  output += " ops/sec";

  output += chalk.gray(" ±");

  output += (margin > 5 ? chalk.red : margin > 2 ? chalk.yellow : chalk.green)(
    margin.toLocaleString("en", {
      style: "decimal",
      useGrouping: false,
      minimumFractionDigits: 2
    })
  );

  output += chalk.blue("%");

  output += chalk.gray(
    ` (${samples} ${samples === 1 ? "run" : "runs"} sampled)`
  );

  return output;
}
