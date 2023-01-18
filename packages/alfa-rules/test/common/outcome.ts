import { Diagnostic, Rule, Outcome } from "@siteimprove/alfa-act";
import { Hashable } from "@siteimprove/alfa-hash";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

export function passed<T extends Hashable, Q, S>(
  rule: Rule<Page, T, Q, S>,
  target: T,
  expectations: { [id: string]: Result<Diagnostic> }
): Outcome.Passed.JSON<T> {
  return Outcome.Passed.of(
    rule,
    target,
    Record.from(Object.entries(expectations))
  ).toJSON();
}

export function failed<T extends Hashable, Q, S>(
  rule: Rule<Page, T, Q, S>,
  target: T,
  expectations: { [id: string]: Result<Diagnostic> }
): Outcome.Failed.JSON<T> {
  return Outcome.Failed.of(
    rule,
    target,
    Record.from(Object.entries(expectations))
  ).toJSON();
}

export function inapplicable<T extends Hashable, Q, S>(
  rule: Rule<Page, T, Q, S>
): Outcome.Inapplicable.JSON {
  return Outcome.Inapplicable.of(rule).toJSON();
}

export function cantTell<T extends Hashable, Q, S>(
  rule: Rule<Page, T, Q, S>,
  target: T,
  diagnostic: Diagnostic = Diagnostic.empty
): Outcome.CantTell.JSON<T> {
  return Outcome.CantTell.of(rule, target, diagnostic).toJSON();
}
