import { Diagnostic, Rule, Outcome } from "@siteimprove/alfa-act";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

export function passed<T, Q>(
  rule: Rule<Page, T, Q>,
  target: T,
  expectations: { [id: string]: Result<Diagnostic> }
): Outcome.Passed.JSON {
  return Outcome.Passed.of(
    rule,
    target,
    Record.from(Object.entries(expectations))
  ).toJSON();
}

export function failed<T, Q>(
  rule: Rule<Page, T, Q>,
  target: T,
  expectations: { [id: string]: Result<Diagnostic> }
): Outcome.Failed.JSON {
  return Outcome.Failed.of(
    rule,
    target,
    Record.from(Object.entries(expectations))
  ).toJSON();
}

export function inapplicable<T, Q>(
  rule: Rule<Page, T, Q>
): Outcome.Inapplicable.JSON {
  return Outcome.Inapplicable.of(rule).toJSON();
}

export function cantTell<T, Q>(
  rule: Rule<Page, T, Q>,
  target: T
): Outcome.CantTell.JSON {
  return Outcome.CantTell.of(rule, target).toJSON();
}
