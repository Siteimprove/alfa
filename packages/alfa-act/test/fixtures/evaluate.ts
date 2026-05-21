import { Future } from "@siteimprove/alfa-future";
import { None } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import type { Result } from "@siteimprove/alfa-result";

import {
  Diagnostic,
  Outcome,
  Rule as ActRule,
  type Oracle,
} from "../../src/index.ts";

import { Target } from "./target.ts";

/**
 * Evaluate a rule and return serialized outcomes.
 */
export async function evaluate<Q extends {} = {}>(
  rule: ActRule<Iterable<Target>, Target, Q, Target>,
  input: Iterable<Target> = [],
  oracle: Oracle<Iterable<Target>, Target, Q, Target> = () => Future.now(None),
): Promise<Array<Outcome.JSON>> {
  return Array.from(await rule.evaluate(input, oracle)).map((o) => o.toJSON());
}

/**
 * Builds a Passed outcome.
 */
export function passed(
  rule: ActRule<Iterable<Target>, Target, {}, Target>,
  target: Target,
  expectations: { [id: string]: Result<Diagnostic> },
  mode: Outcome.Mode = Outcome.Mode.Automatic,
): Outcome.Passed.JSON<Target> {
  return Outcome.Passed.of(
    rule,
    target,
    Record.from(Object.entries(expectations)),
    mode,
  ).toJSON();
}

/**
 * Builds a Failed outcome.
 */
export function failed(
  rule: ActRule<Iterable<Target>, Target, {}, Target>,
  target: Target,
  expectations: { [id: string]: Result<Diagnostic> },
  mode: Outcome.Mode = Outcome.Mode.Automatic,
): Outcome.Failed.JSON<Target> {
  return Outcome.Failed.of(
    rule,
    target,
    Record.from(Object.entries(expectations)),
    mode,
  ).toJSON();
}

/**
 * Builds a CantTell outcome.
 */
export function cantTell(
  rule: ActRule<Iterable<Target>, Target, {}, Target>,
  target: Target,
  diagnostic: Diagnostic = Diagnostic.empty(),
  mode: Outcome.Mode = Outcome.Mode.Automatic,
): Outcome.CantTell.JSON<Target> {
  return Outcome.CantTell.of(rule, target, diagnostic, mode).toJSON();
}

/**
 * Builds an Inapplicable outcome.
 */
export function inapplicable(
  rule: ActRule<Iterable<Target>, Target, {}, Target>,
  mode: Outcome.Mode = Outcome.Mode.Automatic,
): Outcome.Inapplicable.JSON {
  return Outcome.Inapplicable.of(rule, mode).toJSON();
}
