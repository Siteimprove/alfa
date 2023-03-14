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
   * We want to export types for the possible inputs, targets, … of rules.
   * Since there is no variance annotation on the Rule type, we can't apply
   * the act.Rule.* extractors to the unions of rules.
   * That is,
   * Atomic<I, T, Q, S> | Atomic<I', T', Q', S'>
   * does **not** extend Rule<?, ?, ?, ?> and act.Rule.Input will result
   * in `never` rather than `I | I'`
   *
   * So, instead, we need to apply act.Rule.Input on each individual type of
   * the union. This is not directly possible, but can be done through mapped
   * types on an object type containing all the possibilities.
   *
   * We first construct the object type ({R1: Atomic<…>, R2: …}) and its keys
   * ("R1" | "R2" | …)
   * Next, for each extractor, we iterate it over the values of the object type
   * and only keep the resulting values. The unions are then automatically
   * collapsed as we won them.
   */
  type RulesObject = typeof rules;

  /**
   * The keys of all rules
   * This looks like: "R1" | "R2" | …
   */
  type Keys = keyof RulesObject;

  /**
   * The type of the input of rules
   *
   * @public
   */
  export type Input = { [K in Keys]: act.Rule.Input<RulesObject[K]> }[Keys];

  /**
   * The type of the targets of rules
   *
   * @public
   */
  export type Target = { [K in Keys]: act.Rule.Target<RulesObject[K]> }[Keys];

  /**
   * The type of the questions asked by rules
   *
   * @public
   */
  export type Question = {
    [K in Keys]: act.Rule.Question<RulesObject[K]>;
  }[Keys];

  /**
   * The type of the subjects of questions asked by rules
   *
   * @public
   */
  export type Subject = { [K in Keys]: act.Rule.Subject<RulesObject[K]> }[Keys];

  /**
   * The flattened type of all rules. Target, questions, … are a union of
   * all the possible ones; that is this looks like
   * Rule<Page, Document | Element | …, …>
   *
   * This is a super-type of the individual type of each rule.
   *
   * @public
   */
  export type Rule = act.Rule<Input, Target, Question, Subject>;
}

/**
 * A list of all available rules joined under a single type. The type of each
 * rule is not preserved in the list as the types have been flattened.
 *
 * @public
 */
export const FlattenedRules: Sequence<Flattened.Rule> = Sequence.from(
  Rules.values()
);

export default FlattenedRules;

export * from "./common/act/diagnostic";
export * from "./common/act/group";
export * from "./common/act/question";
