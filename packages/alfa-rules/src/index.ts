import { Rule } from "@siteimprove/alfa-act";
import { Record } from "@siteimprove/alfa-record";

import * as rules from "./rules";

type Rules = Record.Value<typeof rules>;

/**
 * An immutable record of individual rules. The type of each individual rule is
 * preserved in the record.
 *
 * @public
 */
export const Rules = Record.of(rules);

/**
 * A list of all available rules joined under a single type. The type of each
 * rule is not preserved in the list as the types have been flattened.
 *
 * @public
 */
const flattened: Iterable<
  Rule<Rule.Input<Rules>, Rule.Target<Rules>, Rule.Question<Rules>>
> = [...Rules.values()];

export default flattened;

export * from "./common/question";
