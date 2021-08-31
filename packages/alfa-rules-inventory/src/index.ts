import { Record } from "@siteimprove/alfa-record";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as base from "@siteimprove/alfa-act-base";

export * from "./scope";

import * as rules from "./rules";

type Rule = Record.Value<typeof rules>;

/**
 * @public
 */
export type Rules = typeof Rules;

/**
 * An immutable record of individual rules. The type of each individual rule is
 * preserved in the record.
 *
 * @public
 */
export const Rules = Record.of(rules);

/**
 * @public
 */
type Flattened = Sequence<
  base.Rule<
    base.Rule.Input<Rule>,
    base.Rule.Target<Rule>,
    base.Rule.Question<Rule>,
    base.Rule.Subject<Rule>
  >
>;

/**
 * A list of all available rules joined under a single type. The type of each
 * rule is not preserved in the list as the types have been flattened.
 *
 * @public
 */
const Flattened: Flattened = Sequence.from(Rules.values()) as Flattened;

export default Flattened;
