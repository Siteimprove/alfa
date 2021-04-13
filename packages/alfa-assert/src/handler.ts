import { Rule, Outcome } from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";

/**
 * @public
 */
export interface Handler<I, T, Q> {
  (
    input: I,
    rules: Iterable<Rule<I, T, Q>>,
    outcomes: Iterable<Outcome<I, T, Q>>,
    message: string
  ): Future.Maybe<string>;
}
