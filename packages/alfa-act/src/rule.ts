import { Array } from "@siteimprove/alfa-array";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Performance } from "@siteimprove/alfa-performance";
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
import { Either, Left, Right } from "@siteimprove/alfa-either";

const { flatMap, flatten, reduce } = Iterable;

/**
 * @public
 * * I: type of Input for the rule
 * * T: type of the test targets
 * * Q: questions' metadata type
 * * S: possible types of questions' subject.
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

  public hasRequirement(requirement: Requirement): boolean;

  public hasRequirement(predicate: Predicate<Requirement>): boolean;

  public hasRequirement(
    requirementOrPredicate: Requirement | Predicate<Requirement>
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

  public evaluate(
    input: I,
    oracle: Oracle<I, T, Q, S> = () => Future.now(None),
    outcomes: Cache = Cache.empty(),
    performance?: Performance<Rule.Event<I, T, Q, S>>
  ): Future<Iterable<Outcome<I, T, Q, S>>> {
    return this._evaluate(input, oracle, outcomes, performance);
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
    (
      input: Readonly<I>,
      oracle: Oracle<I, T, Q, S>,
      outcomes: Cache,
      performance?: Performance<Event<I, T, Q, S>>
    ): Future<Iterable<Outcome<I, T, Q, S>>>;
  }

  export class Atomic<I = unknown, T = unknown, Q = never, S = T> extends Rule<
    I,
    T,
    Q,
    S
  > {
    public static of<I, T = unknown, Q = never, S = T>(properties: {
      uri: string;
      requirements?: Iterable<Requirement>;
      tags?: Iterable<Tag>;
      evaluate: Atomic.Evaluate<I, T, Q, S>;
    }): Atomic<I, T, Q, S> {
      return new Atomic(
        properties.uri,
        Array.from(properties.requirements ?? []),
        Array.from(properties.tags ?? []),
        properties.evaluate
      );
    }

    private constructor(
      uri: string,
      requirements: Array<Requirement>,
      tags: Array<Tag>,
      evaluate: Atomic.Evaluate<I, T, Q, S>
    ) {
      super(uri, requirements, tags, (input, oracle, outcomes, performance) =>
        outcomes.get(this, () => {
          const startRule = performance?.mark(Event.start(this)).start;

          // In the evaluate function in Atomic.of, "this" is not yet build.
          // So we need a helper to wrap it…
          const rulePerformance =
            performance !== undefined
              ? {
                  mark: (name: string) =>
                    performance?.mark(Event.start(this, name)),
                  measure: (name: string, start?: number) =>
                    performance?.measure(Event.end(this, name), start),
                }
              : undefined;

          const { applicability, expectations } = evaluate(
            input,
            rulePerformance
          );

          const startApplicability = performance?.mark(
            Event.startApplicability(this)
          ).start;
          let startExpectation: number | undefined;

          return Future.traverse(applicability(), (interview) =>
            Interview.conduct(interview, this, oracle).map((target) =>
              target
                .left()
                // In case of a question we will drop that
                .flatMap((t) => (Option.isOption(t) ? t : Option.of(t)))
            )
          )
            .map((targets) => Sequence.from(flatten<T>(targets)))
            .tee(() => {
              performance?.measure(
                Event.endApplicability(this),
                startApplicability
              );
              startExpectation = performance?.mark(
                Event.startExpectation(this)
              ).start;
            })
            .flatMap<Iterable<Outcome<I, T, Q, S>>>((targets) => {
              if (targets.isEmpty()) {
                return Future.now([Outcome.Inapplicable.of(this)]);
              }

              return Future.traverse(targets, (target) =>
                resolve(target, Record.of(expectations(target)), this, oracle)
              ).tee(() => {
                performance?.measure(
                  Event.endExpectation(this),
                  startExpectation
                );
              });
            })
            .tee(() => {
              performance?.measure(Event.end(this), startRule);
            });
        })
      );
    }

    public toJSON(): Atomic.JSON {
      return {
        type: "atomic",
        uri: this._uri,
        requirements: this._requirements.map((requirement) =>
          requirement.toJSON()
        ),
        tags: this._tags.map((tag) => tag.toJSON()),
      };
    }
  }

  export namespace Atomic {
    export interface JSON extends Rule.JSON {
      type: "atomic";
    }

    export interface Evaluate<I, T, Q, S> {
      (
        input: I,
        performance?: {
          mark: (name: string) => Performance.Mark<Event<I, T, Q, S>>;
          measure: (
            name: string,
            start?: number
          ) => Performance.Measure<Event<I, T, Q, S>>;
        }
      ): {
        applicability(): Iterable<Interview<Q, S, T, Option.Maybe<T>>>;
        expectations(target: T): {
          [key: string]: Interview<Q, S, T, Option.Maybe<Result<Diagnostic>>>;
        };
      };
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
  }

  export const { isAtomic } = Atomic;

  export class Composite<
    I = unknown,
    T = unknown,
    Q = never,
    S = T
  > extends Rule<I, T, Q, S> {
    public static of<I, T = unknown, Q = never, S = T>(properties: {
      uri: string;
      requirements?: Iterable<Requirement>;
      tags?: Iterable<Tag>;
      composes: Iterable<Rule<I, T, Q, S>>;
      evaluate: Composite.Evaluate<I, T, Q, S>;
    }): Composite<I, T, Q, S> {
      return new Composite(
        properties.uri,
        Array.from(properties.requirements ?? []),
        Array.from(properties.tags ?? []),
        Array.from(properties.composes),
        properties.evaluate
      );
    }

    private readonly _composes: Array<Rule<I, T, Q, S>>;

    private constructor(
      uri: string,
      requirements: Array<Requirement>,
      tags: Array<Tag>,
      composes: Array<Rule<I, T, Q, S>>,
      evaluate: Composite.Evaluate<I, T, Q, S>
    ) {
      super(uri, requirements, tags, (input, oracle, outcomes, performance) =>
        outcomes.get(this, () => {
          const startRule = performance?.mark(Event.start(this)).start;

          // In the evaluate function in Atomic.of, "this" is not yet build.
          // So we need a helper to wrap it…
          const rulePerformance =
            performance !== undefined
              ? {
                  mark: (name: string) =>
                    performance?.mark(Event.start(this, name)),
                  measure: (name: string, start?: number) =>
                    performance?.measure(Event.end(this, name), start),
                }
              : undefined;

          return Future.traverse(this._composes, (rule) =>
            rule.evaluate(input, oracle, outcomes, performance)
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

              const { expectations } = evaluate(input, rulePerformance);

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
            .tee(() => {
              performance?.measure(Event.end(this), startRule);
            });
        })
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
      (
        input: I,
        performance?: {
          mark: (name: string) => Performance.Mark<Event<I, T, Q, S>>;
          measure: (
            name: string,
            start?: number
          ) => Performance.Measure<Event<I, T, Q, S>>;
        }
      ): {
        expectations(outcomes: Sequence<Outcome.Applicable<I, T, Q, S>>): {
          [key: string]: Interview<Q, S, T, Option.Maybe<Result<Diagnostic>>>;
        };
      };
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

  export const { isComposite } = Composite;

  /**
   * @public
   */
  export class Event<
    INPUT,
    TARGET,
    QUESTION,
    SUBJECT,
    TYPE extends Event.Type = Event.Type,
    NAME extends string = string
  > implements Serializable<Event.JSON<TYPE, NAME>>
  {
    public static of<
      INPUT,
      TARGET,
      QUESTION,
      SUBJECT,
      TYPE extends Event.Type,
      NAME extends string
    >(
      type: TYPE,
      rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
      name: NAME
    ): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
      return new Event(type, rule, name);
    }

    private readonly _type: TYPE;
    private readonly _rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>;
    private readonly _name: NAME;

    constructor(
      type: TYPE,
      rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
      name: NAME
    ) {
      this._type = type;
      this._rule = rule;
      this._name = name;
    }

    public get type(): TYPE {
      return this._type;
    }

    public get rule(): Rule<INPUT, TARGET, QUESTION, SUBJECT> {
      return this._rule;
    }

    public get name(): NAME {
      return this._name;
    }

    public toJSON(): Event.JSON<TYPE, NAME> {
      return {
        type: this._type,
        rule: this._rule.toJSON(),
        name: this._name,
      };
    }
  }

  /**
   * @public
   */
  export namespace Event {
    export type Type = "start" | "end";

    export interface JSON<T extends Type = Type, N extends string = string> {
      [key: string]: json.JSON;
      type: T;
      rule: Rule.JSON;
      name: N;
    }

    export function isEvent<
      INPUT,
      TARGET,
      QUESTION,
      SUBJECT,
      TYPE extends Event.Type = Event.Type,
      NAME extends string = string
    >(
      value: unknown
    ): value is Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
      return value instanceof Event;
    }

    export function start<I, T, Q, S, N extends string = string>(
      rule: Rule<I, T, Q, S>,
      name: N
    ): Event<I, T, Q, S, "start", N>;

    export function start<I, T, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "start", "rule">;

    export function start<I, T, Q, S>(
      rule: Rule<I, T, Q, S>,
      name: string = "rule"
    ): Event<I, T, Q, S, "start"> {
      return Event.of("start", rule, name);
    }

    export function end<I, T, Q, S, N extends string = string>(
      rule: Rule<I, T, Q, S>,
      name: N
    ): Event<I, T, Q, S, "end", N>;

    export function end<I, T, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "end", "rule">;

    export function end<I, T, Q, S>(
      rule: Rule<I, T, Q, S>,
      name: string = "rule"
    ): Event<I, T, Q, S, "end"> {
      return Event.of("end", rule, name);
    }

    export function startApplicability<I, T, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "start", "applicability"> {
      return Event.of("start", rule, "applicability");
    }

    export function endApplicability<I, T, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "end", "applicability"> {
      return Event.of("end", rule, "applicability");
    }

    export function startExpectation<I, T, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "start", "expectation"> {
      return Event.of("start", rule, "expectation");
    }

    export function endExpectation<I, T, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "end", "expectation"> {
      return Event.of("end", rule, "expectation");
    }
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
  function processExpectation(
    acc: Either<List<[string, Option<Result<Diagnostic>>]>, Diagnostic>,
    [id, expectation]: readonly [
      string,
      Either<Option.Maybe<Result<Diagnostic, Diagnostic>>, Diagnostic>
    ]
  ): Either<List<[string, Option<Result<Diagnostic>>]>, Diagnostic> {
    return expectation.either(
      (result) =>
        acc.either<
          Either<List<[string, Option<Result<Diagnostic>>]>, Diagnostic>
        >(
          (accumulator) =>
            Left.of(
              accumulator.append([
                id,
                Option.isOption(result) ? result : Option.of(result),
              ])
            ),
          (diagnostic) => Right.of(diagnostic)
        ),
      (diagnostic) => Right.of(diagnostic)
    );
  }

  return Future.traverse(expectations, ([id, interview]) =>
    Interview.conduct(interview, rule, oracle).map(
      (expectation) => [id, expectation] as const
    )
  )
    .map((expectations) =>
      reduce(
        expectations,
        (
          acc: Either<List<[string, Option<Result<Diagnostic>>]>, Diagnostic>,
          expectation
        ) => processExpectation(acc, expectation),
        Left.of(List.empty<[string, Option<Result<Diagnostic>>]>())
      )
    )
    .map((left) =>
      left.either(
        (expectations) => Outcome.from(rule, target, Record.from(expectations)),
        (diagnostic) => Outcome.CantTell.of(rule, target, diagnostic)
      )
    );
}
