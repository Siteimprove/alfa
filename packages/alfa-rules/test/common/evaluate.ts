import { Rule, Outcome } from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";
import { Page } from "@siteimprove/alfa-web";

export function evaluate<T, Q>(
  rule: Rule<Page, T, Q>,
  page: Partial<Page>
): Future<Array<Outcome<Page, T, Q>>> {
  return rule.evaluate(Page.of(page)).map(outcomes => [...outcomes]);
}
