import { Array } from "@siteimprove/alfa-array";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None } from "@siteimprove/alfa-option";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

import { Cache } from "./cache";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Requirement } from "./requirement";
import { Tag } from "./tag";

/**
 * @public
 */
export abstract class Rule<I = unknown, T = unknown, Q = never, S = T>
  implements
    Equatable,
    json.Serializable<Rule.JSON>,
    earl.Serializable<Rule.EARL>,
    sarif.Serializable<sarif.ReportingDescriptor>
{
  protected readonly _uri: string;
  protected readonly _requirements: Array<Requirement>;
  protected readonly _tags: Array<Tag>;
  protected readonly _evaluate: Rule.Evaluate<I, T, Q, S>;

  protected constructor(
    uri: string,
    requirements: Array<Requirement>,
    tags: Array<Tag>,
    evaluator: Rule.Evaluate<I, T, Q, S>
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

  public hasRequirement(requirement: Requirement): boolean {
    return Array.includes(this._requirements, requirement);
  }

  public hasTag(tag: Tag): boolean {
    return Array.includes(this._tags, tag);
  }

  public evaluate(
    input: I,
    oracle: Oracle<I, T, Q, S> = () => Future.now(None),
    outcomes: Cache = Cache.empty()
  ): Future<Iterable<Outcome<I, T, Q, S>>> {
    return this._evaluate(input, oracle, outcomes);
  }

  public equals<I, T, Q, S>(value: Rule<I, T, Q, S>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Rule && value._uri === this._uri;
  }

  public abstract toJSON(): Rule.JSON;

  public toEARL(): Rule.EARL {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
        dct: "http://purl.org/dc/terms/",
      },
      "@type": ["earl:TestCriterion", "earl:TestCase"],
      "@id": this._uri,
      "dct:isPartOf": {
        "@set": this._requirements.map((requirement) => requirement.toEARL()),
      },
    };
  }

  public toSARIF(): sarif.ReportingDescriptor {
    return {
      id: this._uri,
      helpUri: this._uri,
    };
  }
}

/**
 * @public
 */
export namespace Rule {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
    uri: string;
    requirements: Array<Requirement.JSON>;
    tags: Array<Tag.JSON>;
  }

  export interface EARL extends earl.EARL {
    "@context": {
      earl: "http://www.w3.org/ns/earl#";
      dct: "http://purl.org/dc/terms/";
    };
    "@type": ["earl:TestCriterion", "earl:TestCase"];
    "@id": string;
    "dct:isPartOf": {
      "@set": Array<Requirement.EARL>;
    };
  }

  export type Input<R> = R extends Rule<infer I, any, any, any> ? I : never;

  export type Target<R> = R extends Rule<any, infer T, any, any> ? T : never;

  export type Question<R> = R extends Rule<any, any, infer Q, any> ? Q : never;

  export type Subject<R> = R extends Rule<any, any, any, infer S> ? S : never;

  export function isRule<I, T, Q, S>(
    value: unknown
  ): value is Rule<I, T, Q, S> {
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
  export interface Evaluate<I, T, Q, S> {
    (input: Readonly<I>, oracle: Oracle<I, T, Q, S>, outcomes: Cache): Future<
      Iterable<Outcome<I, T, Q, S>>
    >;
  }
}
