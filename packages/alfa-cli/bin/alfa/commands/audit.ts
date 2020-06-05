/// <reference types="node" />

import * as fs from "fs";
import * as temp from "tempy";

import { Command, flags } from "@oclif/command";
import { error } from "@oclif/errors";

import * as parser from "@oclif/parser";

import { Outcome } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-dom";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Rules, Question } from "@siteimprove/alfa-rules";
import { Page } from "@siteimprove/alfa-web";

import * as act from "@siteimprove/alfa-act";

import Scrape from "./scrape";

import { Oracle } from "../../../src/oracle";

type Input = Page;
type Target = Node | Iterable<Node>;

export default class Audit extends Command {
  public static description = "Perform an accessibility audit of a page";

  public static flags = {
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

  public static args = [
    {
      name: "url",
      description:
        "The URL of the page to audit. If no URL is provided, an already serialised page will be read from stdin",
    },
  ];

  public async run() {
    const { args, flags } = this.parse(Audit);

    await Audit.runWithFlags(flags, args.url);
  }

  public static async runWithFlags(flags: Flags, target?: string) {
    const formatter = Formatter.load<Input, Target, Question>(flags.format);

    if (formatter.isErr()) {
      error(formatter.getErr(), { exit: 1 });
    }

    let json: string;

    if (target === undefined) {
      json = fs.readFileSync(0, "utf-8");
    } else {
      const output = temp.file({ extension: "json" });

      await Scrape.runWithFlags({ ...flags, output }, target);

      json = fs.readFileSync(output, "utf-8");

      fs.unlinkSync(output);
    }

    const page = Page.from(JSON.parse(json));

    const audit = Rules.reduce(
      (audit, rule) => audit.add(rule),
      act.Audit.of<Input, Target, Question>(
        page,
        flags.interactive ? Oracle(page) : undefined
      )
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

    const output = formatter.get()(page, outcomes) + "\n";

    if (flags.output === undefined) {
      process.stdout.write(output);
    } else {
      fs.writeFileSync(flags.output, output);
    }
  }
}

export type Flags = typeof Audit extends parser.Input<infer F> ? F : never;
