import { Diagnostic, Outcome } from "@siteimprove/alfa-act";
import type { Question, Rule } from "@siteimprove/alfa-act";
import type { Hashable } from "@siteimprove/alfa-hash";
import { Record } from "@siteimprove/alfa-record";
import type { Result } from "@siteimprove/alfa-result";
import type { Page } from "@siteimprove/alfa-web";

export function passed<T extends Hashable, Q extends Question.Metadata, S>(
  rule: Rule<Page, T, Q, S>,
  target: T,
  expectations: { [id: string]: Result<Diagnostic> },
  mode: Outcome.Mode = Outcome.Mode.Automatic
): Outcome.Passed.JSON<T> {
  return Outcome.Passed.of(
    rule,
    target,
    Record.from(Object.entries(expectations)),
    mode
  ).toJSON();
}

export function failed<T extends Hashable, Q extends Question.Metadata, S>(
  rule: Rule<Page, T, Q, S>,
  target: T,
  expectations: { [id: string]: Result<Diagnostic> },
  mode: Outcome.Mode = Outcome.Mode.Automatic
): Outcome.Failed.JSON<T> {
  return Outcome.Failed.of(
    rule,
    target,
    Record.from(Object.entries(expectations)),
    mode
  ).toJSON();
}

export function inapplicable<
  T extends Hashable,
  Q extends Question.Metadata,
  S
>(
  rule: Rule<Page, T, Q, S>,
  mode: Outcome.Mode = Outcome.Mode.Automatic
): Outcome.Inapplicable.JSON {
  return Outcome.Inapplicable.of(rule, mode).toJSON();
}

export function cantTell<T extends Hashable, Q extends Question.Metadata, S>(
  rule: Rule<Page, T, Q, S>,
  target: T,
  diagnostic: Diagnostic = Diagnostic.empty,
  mode: Outcome.Mode = Outcome.Mode.Automatic
): Outcome.CantTell.JSON<T> {
  return Outcome.CantTell.of(rule, target, diagnostic, mode).toJSON();
}
