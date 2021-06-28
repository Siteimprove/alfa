import { Equatable } from "@siteimprove/alfa-equatable";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import { Cache } from "./cache";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Requirement } from "./requirement";
import { Tag } from "./tag";

/**
 * @public
 */
export abstract class Rule<I = unknown, T = unknown, Q = never>
  implements Equatable, json.Serializable<Rule.JSON> {
  protected readonly _uri: string;
  protected readonly _requirements: Array<Requirement>;
  protected readonly _tags: Array<Tag>;
  protected readonly _evaluate: Rule.Evaluate<I, T, Q>;

  protected constructor(
    uri: string,
    requirements: Array<Requirement>,
    tags: Array<Tag>,
    evaluator: Rule.Evaluate<I, T, Q>
  ) {
    this._uri = uri;
    this._requirements = requirements;
    this._tags = tags;
    this._evaluate = evaluator;
  }

  public get uri(): string {
    return this._uri;
  }

  public get requirements(): ReadonlyArray<Requirement> {
    return this._requirements;
  }

  public get tags(): ReadonlyArray<Tag> {
    return this._tags;
  }

  public evaluate(
    input: Readonly<I>,
    oracle: Oracle<I, T, Q> = () => Future.now(None),
    outcomes: Cache = Cache.empty()
  ): Future<Iterable<Outcome<I, T, Q>>> {
    return this._evaluate(input, oracle, outcomes);
  }

  public equals<I, T, Q>(value: Rule<I, T, Q>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Rule && value._uri === this._uri;
  }

  public abstract toJSON(): Rule.JSON;
}

/**
 * @public
 */
export namespace Rule {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON;
    type: T;
    uri: string;
    requirements: Array<Requirement.JSON>;
    tags: Array<Tag.JSON>;
  }

  export type Input<R> = R extends Rule<infer I, any, any> ? I : never;

  export type Target<R> = R extends Rule<any, infer T, any> ? T : never;

  export type Question<R> = R extends Rule<any, any, infer Q> ? Q : never;

  export function isRule<I, T, Q>(value: unknown): value is Rule<I, T, Q> {
    return value instanceof Rule;
  }

  /**
   * @remarks
   * We use a short-lived cache during audits for rules to store their outcomes.
   * It effectively acts as a memoization layer on top of each rule evaluation
   * procedure, which comes in handy when dealing with composite rules that are
   * dependant on the outcomes of other rules. There are several ways in which
   * audits of such rules can be performed:
   *
   * 1. Put the onus on the caller to construct an audit with dependency-ordered
   *    rules. This is just crazy.
   *
   * 2. Topologically sort rules based on their dependencies before performing
   *    an audit. This requires graph operations.
   *
   * 3. Disregard order entirely and simply run rule evaluation procedures as
   *    their outcomes are needed, thereby risking repeating some of these
   *    procedures. This requires nothing.
   *
   * Given that 3. is the simpler, and non-crazy, approach, we can use this
   * approach in combination with memoization to avoid the risk of repeating
   * rule evaluation procedures.
   */
  export interface Evaluate<I, T, Q> {
    (input: Readonly<I>, oracle: Oracle<I, T, Q>, outcomes: Cache): Future<
      Iterable<Outcome<I, T, Q>>
    >;
  }
}
