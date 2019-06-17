import {
  Aspect,
  Aspects,
  AspectsFor,
  audit,
  Result,
  Target
} from "@siteimprove/alfa-act";
import { Rules } from "@siteimprove/alfa-rules";
import { Scraper } from "@siteimprove/alfa-scrape";
import { values } from "@siteimprove/alfa-util";

import * as fs from "fs";

import * as Formatters from "../../../src/formatters";
import { Arguments, Command, Formatter } from "../../../src/types";

export const Audit: Command<Audit.Options> = {
  command: "audit <url>",
  describe: "Perform an accessibility audit of a page",
  handler,
  builder: argv =>
    argv
      .positional("url", { type: "string" })
      .demandOption("url")

      .option("interactive", { type: "boolean", alias: "i", default: false })

      .option("timeout", { type: "number", default: 10000 })

      .option("format", { type: "string", alias: "f", default: "earl" })

      .option("output", { type: "string", alias: "o" })

      .option("width", { type: "number", alias: "w", default: 800 })

      .option("height", { type: "number", alias: "h", default: 600 })

      .option("scale", { type: "number", default: 1 })

      .option("orientation", {
        choices: ["landscape", "orientation"],
        default: "landscape"
      })
};

export namespace Audit {
  export interface Options {
    url: string;
    interactive: boolean;
    timeout: number;
    format: string;
    output?: string;

    // Viewport options
    width: number;
    height: number;
    scale: number;
    orientation: string;
  }
}

const rules = values(Rules);

async function handler(args: Arguments<Audit.Options>): Promise<void> {
  const scraper = new Scraper();

  let aspects: Aspects;
  try {
    aspects = await scraper.scrape(args.url, {
      timeout: args.timeout,
      viewport: {
        width: args.width,
        height: args.height,
        scale: args.scale,
        landscape: args.orientation === "landscape"
      }
    });
  } catch (err) {
    throw err;
  } finally {
    scraper.close();
  }

  const { results } = audit(aspects, rules);

  if (args.interactive) {
    // Answers questions
  }

  const output = await report(results, aspects, formatter(args.format));

  if (args.output === undefined) {
    process.stdout.write(`${output}\n`);
  } else {
    fs.writeFileSync(args.output, `${output}\n`);
  }
}

async function report<A extends Aspect, T extends Target>(
  results: Iterable<Result<A, T>>,
  aspects: AspectsFor<A>,
  formatter: Formatter<A, T>
): Promise<string> {
  return formatter(results, aspects);
}

function formatter<A extends Aspect, T extends Target>(
  format: string
): Formatter<A, T> {
  switch (format) {
    case "earl":
      return Formatters.EARL();

    default:
      try {
        return require(format);
      } catch (err) {
        throw new Error(`No such formatter found: ${format}`);
      }
  }
}
