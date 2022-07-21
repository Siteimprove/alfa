import { Record } from "@siteimprove/alfa-record";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as act from "@siteimprove/alfa-act";

export * from "./tags";
import * as experimentalRules from "./experimental";
export { experimentalRules };

import * as deprecatedRules from "./deprecated";
export { deprecatedRules };

import * as rules from "./rules";

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
export namespace Flattened {
  /**
   * The flattened type of all rules. Target, questions, … are a union of
   * all the possible ones; that is this looks like
   * Rule\<Page, Document | Element | …, …\>
   *
   * This is a super-type of the individual type of each rule.
   *
   * @public
   */
  export type Rule = Record.Value<typeof rules>;

  /**
   * The type of the input of rules
   *
   * @public
   */
  export type Input = act.Rule.Input<Rule>;

  /**
   * The type of the targets of rules
   *
   * @public
   */
  export type Target = act.Rule.Target<Rule>;

  /**
   * The type of the questions asked by rules
   *
   * @public
   */
  export type Question = act.Rule.Question<Rule>;

  /**
   * The type of the subjects of questions asked by rules
   *
   * @public
   */
  export type Subject = act.Rule.Subject<Rule>;

  /**
   * The flattened type of the sequence of all rules.
   *
   * @public
   */
  export type Flattened = Sequence<act.Rule<Input, Target, Question, Subject>>;
}

/**
 * A list of all available rules joined under a single type. The type of each
 * rule is not preserved in the list as the types have been flattened.
 *
 * @public
 */
export const Flattened: Flattened.Flattened = Sequence.from<Flattened.Rule>(
  Rules.values()
);

export default Flattened;

export * from "./common/act/diagnostic";
export * from "./common/act/group";
export * from "./common/act/question";
