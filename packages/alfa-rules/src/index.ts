import { Record } from "@siteimprove/alfa-record";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as act from "@siteimprove/alfa-act-base";

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
  act.Rule<
    act.Rule.Input<Rule>,
    act.Rule.Target<Rule>,
    act.Rule.Question<Rule>,
    act.Rule.Subject<Rule>
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

export * from "./common/group";
export * from "./common/question";
