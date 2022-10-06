/// <reference types="node" />

import * as fs from "fs";

import { Audit, Outcome } from "@siteimprove/alfa-act";
import { Command } from "@siteimprove/alfa-command";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Interviewer } from "@siteimprove/alfa-interviewer";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import rules from "@siteimprove/alfa-rules";

import { Profiler } from "../../profiler";

import type { Arguments } from "./arguments";
import type { Flags } from "./flags";

import * as scrape from "../scrape/run";

export const run: Command.Runner<typeof Flags, typeof Arguments> = async ({
  flags,
  args: { url: target },
}) => {
  const formatter = await Formatter.load<any, any, any, any>(flags.format);

  if (formatter.isErr()) {
    return formatter;
  }

  const interviewer = Option.from(
    await flags.interviewer
      .map((interviewer) => Interviewer.load<any, any, any, any>(interviewer))
      .getOr(undefined)
  );

  if (interviewer.some((interviewer) => interviewer.isErr())) {
    return interviewer.get() as Err<string>;
  }

  let json: string;

  if (!target.isSome()) {
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

  const oracle = interviewer
    .map((interviewer) => interviewer.get()(page, rules))
    .getOr(undefined);

  const audit = Audit.of(page, rules, oracle);

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

  const output = await formatter.get()(page, rules, outcomes);

  if (flags.output.isSome()) {
    fs.writeFileSync(flags.output.get(), output + "\n");
    return Result.of("");
  } else {
    return Result.of(output);
  }
};
