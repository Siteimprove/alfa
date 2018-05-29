import { Suite } from "benchmark";
import chalk from "chalk";

type Result = Readonly<{
  id: number;
  title: string;
  frequency: number;
  margin: number;
  samples: number;
}>;

export interface Benchmark {
  add(title: string, callback: () => void | Promise<void>): Benchmark;
  run(): void;
}

export function benchmark(): Benchmark {
  const suite = new Suite();

  const results: Array<Result> = [];

  suite.on("cycle", ({ target }: any) => {
    const { error, hz, id, name, stats } = target;

    if (error) {
      return;
    }

    results.push({
      id,
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

    output += " " + (results.length === 1 ? "test" : "tests") + " completed";

    for (let i = 0, n = results.length; i < n; i++) {
      const char = i === results.length - 1 ? "\u2514" : "\u251c";

      output +=
        "\n" + chalk.dim(char) + " " + format(results[i], fastest, longest);
    }

    console.log(output);
  });

  return suite;
}

function round(number: number, digits: number): number {
  const power = Math.pow(10, digits);
  return Math.round(number * power) / power;
}

function repeat(times: number, string: string = " "): string {
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

  output += chalk.dim(" x ");

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

  output += chalk.dim(" ±");

  output += (margin > 5 ? chalk.red : margin > 2 ? chalk.yellow : chalk.green)(
    margin.toLocaleString("en", {
      style: "decimal",
      useGrouping: false,
      minimumFractionDigits: 2
    })
  );

  output += chalk.blue("%");

  output += chalk.dim(
    ` (${samples} ${samples === 1 ? "run" : "runs"} sampled)`
  );

  return output;
}
