import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import { Audit, Outcome } from "@siteimprove/alfa-act";
import { Orientation } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Rules } from "@siteimprove/alfa-rules";
import { Scraper, Wait } from "@siteimprove/alfa-scrape";
import { Page } from "@siteimprove/alfa-web";

import * as Formatters from "../../../src/formatters";
import { Arguments, Command, Formatter } from "../../../src/types";

export default Command.of<Options>({
  command: "audit <url>",
  describe: "Perform an accessibility audit of a page",
  handler,
  builder: argv =>
    argv
      .positional("url", { type: "string" })
      .demandOption("url")

      .option("interactive", { type: "boolean", alias: "i", default: false })

      .option("timeout", { type: "number", default: 10000 })

      .option("wait", {
        type: "string",
        choices: ["ready", "loaded", "idle"],
        default: "ready"
      })

      .option("format", { type: "string", alias: "f", default: "json" })

      .option("output", { type: "string", alias: "o" })

      .option("outcomes", {
        type: "array",
        choices: ["passed", "failed", "inapplicable", "cantTell"],
        default: []
      })

      .option("width", { type: "number", alias: "w", default: 800 })

      .option("height", { type: "number", alias: "h", default: 600 })

      .option("orientation", {
        type: "string",
        choices: ["landscape", "portrait"],
        default: "landscape"
      })

      .option("resolution", { type: "number", default: 1 })
});

interface Options {
  url: string;
  interactive: boolean;
  timeout: number;
  wait: string;
  format: string;
  output?: string;
  outcomes: Array<string> | null;

  // Viewport options
  width: number;
  height: number;
  orientation: string;

  // Display options
  resolution: number;
}

async function handler(args: Arguments<Options>): Promise<void> {
  const scraper = new Scraper();

  const { timeout, width, height, resolution } = args;

  let wait = Wait.Ready;

  if (args.wait === "loaded") {
    wait = Wait.Loaded;
  } else if (args.wait === "idle") {
    wait = Wait.Idle;
  }

  let orientation = Orientation.Landscape;

  if (args.orientation === "portrait") {
    orientation = Orientation.Portrait;
  }

  let page: Page;
  try {
    page = await scraper.scrape(
      new URL(args.url, url.pathToFileURL(process.cwd() + path.sep)),
      {
        timeout,
        wait,
        viewport: { width, height, orientation },
        display: { resolution }
      }
    );
  } catch (err) {
    throw err;
  } finally {
    scraper.close();
  }

  const audit = Rules.reduce((audit, rule) => audit.add(rule), Audit.of(page));

  const outcomes = audit.evaluate();

  // if (args.outcomes !== null) {
  //   results = [...results].filter(result =>
  //     args.outcomes!.includes(result.outcome)
  //   );
  // }

  let output = await report(outcomes, formatter(args.format));

  output += "\n";

  if (args.output === undefined) {
    process.stdout.write(output);
  } else {
    fs.writeFileSync(args.output, output);
  }
}

async function report<I, T, Q>(
  outcomes: Iterable<Outcome<I, T, Q>>,
  formatter: Formatter<I, T, Q>
): Promise<string> {
  return formatter(outcomes);
}

function formatter<I, T, Q>(format: string): Formatter<I, T, Q> {
  switch (format) {
    case "earl":
      return Formatters.EARL();

    case "json":
      return Formatters.JSON();

    default:
      try {
        return require(format) as Formatter<I, T, Q>;
      } catch (err) {
        throw new Error(`No such formatter found: ${format}`);
      }
  }
}
