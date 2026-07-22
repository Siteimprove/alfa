import { Array } from "@siteimprove/alfa-array";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import type { Iterable } from "@siteimprove/alfa-iterable";
import { None } from "@siteimprove/alfa-option";
import type { Performance } from "@siteimprove/alfa-performance";
import type { Predicate } from "@siteimprove/alfa-predicate";

import type * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import type * as sarif from "@siteimprove/alfa-sarif";

import type { Event } from "./event.ts";

import { Cache } from "../cache.ts";
import type { Oracle, Question } from "../expectation/index.ts";
import { Requirement, Tag } from "../metadata/index.ts";
import type { Outcome } from "../outcome.ts";

/**
 * @public
 * * I: type of Input for the rule
 * * T: type of the test targets
 * * Q: questions' metadata type
 * * S: possible types of questions' subject.
 */
export abstract class Rule<
  I,
  T extends Hashable,
  Q extends Question.Metadata = {},
  S = T,
>
  implements
    Equatable,
    Hashable,
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
    evaluator: Rule.Evaluate<I, T, Q, S>,
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

  public hasRequirement(requirement: Requirement): boolean;

  public hasRequirement(predicate: Predicate<Requirement>): boolean;

  public hasRequirement(
    requirementOrPredicate: Requirement | Predicate<Requirement>,
  ): boolean {
    const predicate = Requirement.isRequirement(requirementOrPredicate)
      ? (requirement: unknown) => requirementOrPredicate.equals(requirement)
      : requirementOrPredicate;
    return Array.some(this._requirements, predicate);
  }

  public hasTag(tag: Tag): boolean;

  public hasTag(predicate: Predicate<Tag>): boolean;

  public hasTag(tagOrPredicate: Tag | Predicate<Tag>): boolean {
    const predicate = Tag.isTag(tagOrPredicate)
      ? (tag: unknown) => tagOrPredicate.equals(tag)
      : tagOrPredicate;

    return Array.some(this._tags, predicate);
  }

  // Despite returning a promise, this method is **not** async as it would wrap
  // it in a new promise every time. So, the return value is the cached promise.
  // If it were async, the return value would be a new promise created upon call,
  // even if they would still ultimately return the same cache object and would
  // not duplicate the computation.
  public evaluate(
    input: I,
    // A rule asking no questions, never calls its oracle, so it can be anything
    oracle: {} extends Q ? any : Oracle<I, T, Q, S> = () =>
      Promise.resolve(None),
    outcomes: Cache = Cache.empty(),
    performance?: Performance<Event<I, T, Q, S>>,
  ): Promise<Iterable<Outcome<I, T, Q, S>>> {
    return this._evaluate(input, oracle, outcomes, performance);
  }

  public equals<I, T extends Hashable, Q extends Question.Metadata, S>(
    value: Rule<I, T, Q, S>,
  ): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Rule && value._uri === this._uri;
  }

  public hash(hash: Hash) {
    hash.writeString(this._uri);
  }

  public abstract toJSON(options: {
    verbosity: json.Serializable.Verbosity.Minimal;
  }): Rule.MinimalJSON;

  public abstract toJSON(): Rule.JSON;

  public abstract toJSON(
    options?: json.Serializable.Options,
  ): Rule.MinimalJSON | Rule.JSON;

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
  export interface MinimalJSON {
    [key: string]: json.JSON;
    uri: string;
  }

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
  export interface Evaluate<
    I,
    T extends Hashable,
    Q extends Question.Metadata,
    S,
  > {
    (
      input: Readonly<I>,
      // A rule asking no questions, never calls its oracle, so it can be anything
      oracle: {} extends Q ? any : Oracle<I, T, Q, S>,
      outcomes: Cache,
      performance?: Performance<Event<I, T, Q, S>>,
    ): Promise<Iterable<Outcome<I, T, Q, S>>>;
  }
}
