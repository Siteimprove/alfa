import * as fs from "fs";
import * as temp from "tempy";

import { Command, flags } from "@oclif/command";

import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Rules, Question } from "@siteimprove/alfa-rules";
import { Page } from "@siteimprove/alfa-web";

import * as act from "@siteimprove/alfa-act";

import Scrape from "./scrape";

import { Formatter } from "../../../src/formatter";
import { Oracle } from "../../../src/oracle";

export default class Audit extends Command {
  static description = "Perform an accessibility audit of a page";

  static flags = {
    ...Scrape.flags,

    help: flags.help({
      description: "Display this command help",
    }),

    interactive: flags.boolean({
      char: "i",
      default: false,
      allowNo: true,
      description: "Whether or not to run an interactive audit",
    }),

    format: flags.string({
      char: "f",
      default: "earl",
      helpValue: "format or package",
      description: "The reporting format to use",
    }),

    output: flags.string({
      char: "o",
      helpValue: "path",
      description:
        "The path to write results to. If no path is provided, results are written to stdout",
    }),

    outcomes: flags.string({
      options: ["passed", "failed", "inapplicable", "cantTell"],
      multiple: true,
      description:
        "The outcomes to include in the results. If not provided, all outcomes are included",
    }),
  };

  static args = [
    {
      name: "url",
      description:
        "The URL of the page to audit. If no URL is provided, an already serialised page will be read from stdin",
    },
  ];

  async run() {
    const { args, flags } = this.parse(Audit);

    let json: string;

    if (args.url === undefined) {
      json = fs.readFileSync(0, "utf-8");
    } else {
      const argv = [...this.argv];

      const i = argv.indexOf("--output");

      if (i !== -1) {
        argv.splice(i, 2);
      }

      const output = temp.file({ extension: "json" });

      argv.push("--output", output);

      await Scrape.run(argv);

      json = fs.readFileSync(output, "utf-8");

      fs.unlinkSync(output);
    }

    const page = Page.from(JSON.parse(json));

    const audit = Rules.reduce(
      (audit, rule) => audit.add(rule as Rule<Page, unknown, Question>),
      act.Audit.of(page, flags.interactive ? Oracle(page) : undefined)
    );

    let outcomes = await audit.evaluate();

    if (flags.outcomes !== undefined) {
      const filter = new Set(flags.outcomes);

      outcomes = Iterable.filter(outcomes, (outcome) => {
        if (Outcome.isPassed(outcome)) {
          return filter.has("passed");
        }

        if (Outcome.isFailed(outcome)) {
          return filter.has("failed");
        }

        if (Outcome.isInapplicable(outcome)) {
          return filter.has("inapplicable");
        }

        return filter.has("cantTell");
      });
    }

    const output =
      (await report(page, outcomes, formatter(flags.format))) + "\n";

    if (flags.output === undefined) {
      process.stdout.write(output);
    } else {
      fs.writeFileSync(flags.output, output);
    }
  }
}

async function report<I, T, Q>(
  input: I,
  outcomes: Iterable<Outcome<I, T, Q>>,
  formatter: Formatter<I, T, Q>
): Promise<string> {
  return formatter(input, outcomes);
}

function formatter<I, T, Q>(format: string): Formatter<I, T, Q> {
  switch (format) {
    case "earl":
      return Formatter.EARL();

    case "json":
      return Formatter.JSON();

    default:
      try {
        return require(format) as Formatter<I, T, Q>;
      } catch (err) {
        throw new Error(`No such formatter found: ${format}`);
      }
  }
}
