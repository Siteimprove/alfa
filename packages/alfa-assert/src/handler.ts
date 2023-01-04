import { Rule, Outcome } from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";

/**
 * @public
 */
export interface Handler<I, T extends Hashable, Q, S> {
  (
    input: I,
    rules: Iterable<Rule<I, T, Q, S>>,
    outcomes: Iterable<Outcome<I, T, Q, S>>,
    message: string
  ): Future.Maybe<string>;
}
