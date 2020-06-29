/// <reference types="node" />

import * as fs from "fs";

import { Audit, Outcome } from "@siteimprove/alfa-act";
import { Command } from "@siteimprove/alfa-command";
import { Node } from "@siteimprove/alfa-dom";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None } from "@siteimprove/alfa-option";
import { Ok } from "@siteimprove/alfa-result";
import { Rules, Question } from "@siteimprove/alfa-rules";
import { Page } from "@siteimprove/alfa-web";

import { Oracle } from "../../oracle";

import type { Arguments } from "./arguments";
import type { Flags } from "./flags";

import * as scrape from "../scrape/run";

type Input = Page;
type Target = Node | Iterable<Node>;

export const run: Command.Runner<typeof Flags, typeof Arguments> = async ({
  flags,
  args: { url: target },
}) => {
  const formatter = await Formatter.load<Input, Target, Question>(flags.format);

  if (formatter.isErr()) {
    return formatter;
  }

  let json: string;

  if (target.isNone()) {
    json = fs.readFileSync(0, "utf-8");
  } else {
    const result = await scrape.run({
      flags: {
        ...flags,
        output: None,
      },
      args: {
        url: target.get(),
      },
    });

    if (result.isErr()) {
      return result;
    }

    json = result.get();
  }

  const page = Page.from(JSON.parse(json));

  const audit = Rules.reduce(
    (audit, rule) => audit.add(rule),
    Audit.of<Input, Target, Question>(
      page,
      flags.interactive ? Oracle(page) : undefined
    )
  );

  let outcomes = await audit.evaluate();

  if (flags.outcomes.isSome()) {
    const filter = new Set(flags.outcomes.get());

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

  const output = formatter.get()(page, outcomes);

  if (flags.output.isNone()) {
    return Ok.of(output);
  } else {
    fs.writeFileSync(flags.output.get() + "\n", output);
    return Ok.of("");
  }
};
