/// <reference types="node" />

import * as fs from "fs";

import { Audit, Outcome } from "@siteimprove/alfa-act";
import { Command } from "@siteimprove/alfa-command";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None } from "@siteimprove/alfa-option";
import { Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import rules from "@siteimprove/alfa-rules";

import { Oracle } from "../../oracle";
import { Profiler } from "../../profiler";

import type { Arguments } from "./arguments";
import type { Flags } from "./flags";

import * as scrape from "../scrape/run";

export const run: Command.Runner<typeof Flags, typeof Arguments> = async ({
  flags,
  args: { url: target },
}) => {
  const formatter = await Formatter.load<any, any, any>(flags.format);

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

  const audit = Audit.of(
    page,
    rules,
    flags.interactive ? Oracle(page) : undefined
  );

  for (const _ of flags.cpuProfile) {
    await Profiler.CPU.start();
  }

  for (const _ of flags.heapProfile) {
    await Profiler.Heap.start();
  }

  let outcomes = await audit.evaluate();

  for (const path of flags.cpuProfile) {
    fs.writeFileSync(path, JSON.stringify(await Profiler.CPU.stop()) + "\n");
  }

  for (const path of flags.heapProfile) {
    fs.writeFileSync(path, JSON.stringify(await Profiler.Heap.stop()) + "\n");
  }

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

  const output = formatter.get()(page, rules, outcomes);

  if (flags.output.isNone()) {
    return Ok.of(output);
  } else {
    fs.writeFileSync(flags.output.get(), output + "\n");
    return Ok.of("");
  }
};
