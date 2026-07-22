import type { Hashable } from "@siteimprove/alfa-hash";

import { Atomic as AtomicRule } from "./atomic.ts";
import { Composite as CompositeRule } from "./composite.ts";
import { Event as RuleEvent } from "./event.ts";
import { Rule as BaseRule } from "./rule.ts";

import { type Question } from "../expectation/index.ts";

/**
 * @public
 * * I: type of Input for the rule
 * * T: type of the test targets
 * * Q: questions' metadata type
 * * S: possible types of questions' subject.
 */
export type Rule<
  I,
  T extends Hashable,
  Q extends Question.Metadata = {},
  S = T,
> = AtomicRule<I, T, Q, S> | CompositeRule<I, T, Q, S>;

/**
 * @public
 */
export namespace Rule {
  export type MinimalJSON = BaseRule.MinimalJSON;

  export type JSON = BaseRule.JSON;

  export type EARL = BaseRule.EARL;

  export type Evaluate<
    I,
    T extends Hashable,
    Q extends Question.Metadata,
    S,
  > = BaseRule.Evaluate<I, T, Q, S>;

  export type Input<R> = R extends BaseRule<infer I, any, any, any> ? I : never;

  export type Target<R> =
    R extends BaseRule<any, infer T, any, any> ? T : never;

  export type Question<R> =
    R extends BaseRule<any, any, infer Q, any> ? Q : never;

  export type Subject<R> =
    R extends BaseRule<any, any, any, infer S> ? S : never;

  export function isRule<I, T extends Hashable, Q extends Question.Metadata, S>(
    value: unknown,
  ): value is Rule<I, T, Q, S> {
    return value instanceof BaseRule;
  }

  export import Atomic = AtomicRule;

  export const { isAtomic } = AtomicRule;

  export import Composite = CompositeRule;

  export const { isComposite } = CompositeRule;

  export import Event = RuleEvent;

  export const { isEvent } = RuleEvent;
}
