import { Array } from "@siteimprove/alfa-array";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

import { Cache } from "./cache";
import { Diagnostic } from "./diagnostic";
import { Interview } from "./interview";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Requirement } from "./requirement";
import { Tag } from "./tag";

const { flatMap, flatten, reduce } = Iterable;

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
  protected readonly _experimental: boolean;
  protected readonly _requirements: Array<Requirement>;
  protected readonly _tags: Array<Tag>;
  protected readonly _evaluate: Rule.Evaluate<I, T, Q, S>;

  protected constructor(
    uri: string,
    experimental: boolean,
    requirements: Array<Requirement>,
    tags: Array<Tag>,
    evaluator: Rule.Evaluate<I, T, Q, S>
  ) {
    this._uri = uri;
    this._experimental = experimental;
    this._requirements = requirements;
    this._tags = tags;
    this._evaluate = evaluator;
  }

  public get uri(): string {
    return this._uri;
  }

  public get experimental(): boolean {
    return this._experimental;
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

  public hasTag(tag: Tag): boolean;

  public hasTag(predicate: Predicate<Tag>): boolean;

  public hasTag(tagOrPredicate: Tag | Predicate<Tag>): boolean {
    const predicate = Tag.isTag(tagOrPredicate)
      ? (tag: any) => tagOrPredicate.equals(tag)
      : tagOrPredicate;
    return Array.find(this._tags, predicate).isSome();
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
    experimental: boolean;
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

  export class Atomic<I = unknown, T = unknown, Q = never, S = T> extends Rule<
    I,
    T,
    Q,
    S
  > {
    public static of<I, T = unknown, Q = never, S = T>(properties: {
      uri: string;
      experimental?: boolean;
      requirements?: Iterable<Requirement>;
      tags?: Iterable<Tag>;
      evaluate: Atomic.Evaluate<I, T, Q, S>;
    }): Atomic<I, T, Q, S> {
      return new Atomic(
        properties.uri,
        properties.experimental ?? false,
        Array.from(properties.requirements ?? []),
        Array.from(properties.tags ?? []),
        properties.evaluate
      );
    }

    public toJSON(): Atomic.JSON {
      return {
        type: "atomic",
        uri: this._uri,
        experimental: this._experimental,
        requirements: this._requirements.map((requirement) =>
          requirement.toJSON()
        ),
        tags: this._tags.map((tag) => tag.toJSON()),
      };
    }

    private constructor(
      uri: string,
      experimental: boolean,
      requirements: Array<Requirement>,
      tags: Array<Tag>,
      evaluate: Atomic.Evaluate<I, T, Q, S>
    ) {
      super(uri, experimental, requirements, tags, (input, oracle, outcomes) =>
        outcomes.get(this, () => {
          const { applicability, expectations } = evaluate(input);

          return Future.traverse(applicability(), (interview) =>
            Interview.conduct(interview, this, oracle).map((target) =>
              target.flatMap((target) =>
                Option.isOption(target) ? target : Option.of(target)
              )
            )
          )
            .map((targets) => Sequence.from(flatten<T>(targets)))
            .flatMap<Iterable<Outcome<I, T, Q, S>>>((targets) => {
              if (targets.isEmpty()) {
                return Future.now([Outcome.Inapplicable.of(this)]);
              }

              return Future.traverse(targets, (target) =>
                resolve(target, Record.of(expectations(target)), this, oracle)
              );
            });
        })
      );
    }
  }

  export namespace Atomic {
    export interface JSON extends Rule.JSON {
      type: "atomic";
    }

    export interface Evaluate<I, T, Q, S> {
      (input: I): {
        applicability(): Iterable<Interview<Q, S, T, Option.Maybe<T>>>;
        expectations(target: T): {
          [key: string]: Interview<Q, S, T, Option.Maybe<Result<Diagnostic>>>;
        };
      };
    }
  }

  export function isAtomic<I, T, Q, S>(
    value: Rule<I, T, Q, S>
  ): value is Atomic<I, T, Q, S>;

  export function isAtomic<I, T, Q, S>(
    value: unknown
  ): value is Atomic<I, T, Q, S>;

  export function isAtomic<I, T, Q, S>(
    value: unknown
  ): value is Atomic<I, T, Q, S> {
    return value instanceof Atomic;
  }

  export class Composite<
    I = unknown,
    T = unknown,
    Q = never,
    S = T
  > extends Rule<I, T, Q, S> {
    public static of<I, T = unknown, Q = never, S = T>(properties: {
      uri: string;
      experimental?: boolean;
      requirements?: Iterable<Requirement>;
      tags?: Iterable<Tag>;
      composes: Iterable<Rule<I, T, Q, S>>;
      evaluate: Composite.Evaluate<I, T, Q, S>;
    }): Composite<I, T, Q, S> {
      return new Composite(
        properties.uri,
        properties.experimental ?? false,
        Array.from(properties.requirements ?? []),
        Array.from(properties.tags ?? []),
        Array.from(properties.composes),
        properties.evaluate
      );
    }

    private readonly _composes: Array<Rule<I, T, Q, S>>;

    private constructor(
      uri: string,
      experimental: boolean,
      requirements: Array<Requirement>,
      tags: Array<Tag>,
      composes: Array<Rule<I, T, Q, S>>,
      evaluate: Composite.Evaluate<I, T, Q, S>
    ) {
      super(uri, experimental, requirements, tags, (input, oracle, outcomes) =>
        outcomes.get(this, () =>
          Future.traverse(this._composes, (rule) =>
            rule.evaluate(input, oracle, outcomes)
          )
            .map((outcomes) =>
              Sequence.from(
                flatMap(outcomes, function* (outcomes) {
                  for (const outcome of outcomes) {
                    if (Outcome.isApplicable(outcome)) {
                      yield outcome;
                    }
                  }
                })
              )
            )
            .flatMap<Iterable<Outcome<I, T, Q, S>>>((targets) => {
              if (targets.isEmpty()) {
                return Future.now([Outcome.Inapplicable.of(this)]);
              }

              const { expectations } = evaluate(input);

              return Future.traverse(
                targets.groupBy((outcome) => outcome.target),
                ([target, outcomes]) =>
                  resolve(
                    target,
                    Record.of(expectations(outcomes)),
                    this,
                    oracle
                  )
              );
            })
        )
      );

      this._composes = composes;
    }

    public get composes(): ReadonlyArray<Rule<I, T, Q, S>> {
      return this._composes;
    }

    public toJSON(): Composite.JSON {
      return {
        type: "composite",
        uri: this._uri,
        experimental: this._experimental,
        requirements: this._requirements.map((requirement) =>
          requirement.toJSON()
        ),
        tags: this._tags.map((tag) => tag.toJSON()),
        composes: this._composes.map((rule) => rule.toJSON()),
      };
    }
  }

  export namespace Composite {
    export interface JSON extends Rule.JSON {
      type: "composite";
      uri: string;
      composes: Array<Rule.JSON>;
    }

    export interface Evaluate<I, T, Q, S> {
      (input: I): {
        expectations(outcomes: Sequence<Outcome.Applicable<I, T, Q, S>>): {
          [key: string]: Interview<Q, S, T, Option.Maybe<Result<Diagnostic>>>;
        };
      };
    }
  }

  export function isComposite<I, T, Q>(
    value: Rule<I, T, Q>
  ): value is Composite<I, T, Q>;

  export function isComposite<I, T, Q>(
    value: unknown
  ): value is Composite<I, T, Q>;

  export function isComposite<I, T, Q>(
    value: unknown
  ): value is Composite<I, T, Q> {
    return value instanceof Composite;
  }
}

function resolve<I, T, Q, S>(
  target: T,
  expectations: Record<{
    [key: string]: Interview<Q, S, T, Option.Maybe<Result<Diagnostic>>>;
  }>,
  rule: Rule<I, T, Q, S>,
  oracle: Oracle<I, T, Q, S>
): Future<Outcome.Applicable<I, T, Q, S>> {
  return Future.traverse(expectations, ([id, interview]) =>
    Interview.conduct(interview, rule, oracle).map(
      (expectation) => [id, expectation] as const
    )
  ).map((expectations) =>
    reduce(
      expectations,
      (expectations, [id, expectation]) =>
        expectations.flatMap((expectations) =>
          expectation.map((expectation) =>
            expectations.append([
              id,
              Option.isOption(expectation)
                ? expectation
                : Option.of(expectation),
            ])
          )
        ),
      Option.of(List.empty<[string, Option<Result<Diagnostic>>]>())
    )
      .map((expectations) => {
        return Outcome.from(rule, target, Record.from(expectations));
      })
      .getOrElse(() => {
        return Outcome.CantTell.of(rule, target);
      })
  );
}
