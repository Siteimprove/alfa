import { Rule, Outcome } from "@siteimprove/alfa-act";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

export function passed<T, Q>(
  rule: Rule<Page, T, Q>,
  target: T,
  expectations: Iterable<[string, Result<string, string>]>
): Outcome.Passed<Page, T, Q> {
  return Outcome.Passed.of(
    rule,
    target,
    Record.from(Iterable.map(expectations, ([id, exp]) => [id, Some.of(exp)]))
  );
}

export function failed<T, Q>(
  rule: Rule<Page, T, Q>,
  target: T,
  expectations: Iterable<[string, Result<string, string>]>
): Outcome.Failed<Page, T, Q> {
  return Outcome.Failed.of(
    rule,
    target,
    Record.from(Iterable.map(expectations, ([id, exp]) => [id, Some.of(exp)]))
  );
}

export function inapplicable<T, Q>(
  rule: Rule<Page, T, Q>
): Outcome.Inapplicable<Page, T, Q> {
  return Outcome.Inapplicable.of(rule);
}

export function cantTell<T, Q>(
  rule: Rule<Page, T, Q>,
  target: T
): Outcome.CantTell<Page, T, Q> {
  return Outcome.CantTell.of(rule, target);
}
