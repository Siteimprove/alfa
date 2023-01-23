import { Array } from "@siteimprove/alfa-array";

import * as earl from "@siteimprove/alfa-earl";
import { Either, Left, Right } from "@siteimprove/alfa-either";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Future } from "@siteimprove/alfa-future";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Performance } from "@siteimprove/alfa-performance";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import * as sarif from "@siteimprove/alfa-sarif";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Tuple } from "@siteimprove/alfa-tuple";

import { Cache } from "./cache";
import { Diagnostic } from "./diagnostic";
import { Interview } from "./interview";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Requirement } from "./requirement";
import { Tag } from "./tag";

const { flatten, reduce } = Iterable;

/**
 * @public
 * * I: type of Input for the rule
 * * T: type of the test targets
 * * Q: questions' metadata type
 * * S: possible types of questions' subject.
 */
export abstract class Rule<I, T extends Hashable, Q = never, S = T>
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

  public equals<I, T extends Hashable, Q, S>(value: Rule<I, T, Q, S>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Rule && value._uri === this._uri;
  }

  public hash(hash: Hash) {
    hash.writeString(this._uri);
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
  import Applicable = Outcome.Applicable;

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

  export function isRule<I, T extends Hashable, Q, S>(
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
  export interface Evaluate<I, T extends Hashable, Q, S> {
    (
      input: Readonly<I>,
      oracle: Oracle<I, T, Q, S>,
      outcomes: Cache,
      performance?: Performance<Event<I, T, Q, S>>
    ): Future<Iterable<Outcome<I, T, Q, S>>>;
  }

  export class Atomic<I, T extends Hashable, Q = never, S = T> extends Rule<
    I,
    T,
    Q,
    S
  > {
    public static of<I, T extends Hashable, Q = never, S = T>(properties: {
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
              target.either<Tuple<[Option<T>, boolean]>>(
                // We have a target, wrap it properly and return it.
                ([target, oracleUsed]) =>
                  Tuple.of(
                    Option.isOption(target) ? target : Option.of(target),
                    oracleUsed
                  ),
                // We have an unanswered question and return None
                ([_, oracleUsed]) => Tuple.of(None, oracleUsed)
              )
            )
          )
            .map((targets) =>
              // We both need to keep with each target whether the oracle was used,
              // and with the global sequence whether it was used at all.
              // The second case is needed to decide whether the oracle was used
              // when producing an Inapplicable result (empty sequence).
              // None are cleared from the sequence, and Some are opened to only
              // keep the targets.
              Sequence.from(targets).reduce(
                ([acc, wasUsed], [cur, isUsed]) =>
                  cur.isSome()
                    ? Tuple.of(
                        acc.append(Tuple.of(cur.get(), isUsed)),
                        wasUsed || isUsed
                      )
                    : Tuple.of(acc, wasUsed || isUsed),
                Tuple.of(Sequence.empty<Tuple<[T, boolean]>>(), false)
              )
            )
            .tee(() => {
              performance?.measure(
                Event.endApplicability(this),
                startApplicability
              );
              startExpectation = performance?.mark(
                Event.startExpectation(this)
              ).start;
            })
            .flatMap<Iterable<Outcome<I, T, Q, S>>>(([targets, oracleUsed]) => {
              if (targets.isEmpty()) {
                return Future.now([
                  Outcome.Inapplicable.of(this, getMode(oracleUsed)),
                ]);
              }

              return Future.traverse(targets, ([target, oracleUsed]) =>
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

    export interface Evaluate<I, T extends Hashable, Q, S> {
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

    export function isAtomic<I, T extends Hashable, Q, S>(
      value: Rule<I, T, Q, S>
    ): value is Atomic<I, T, Q, S>;

    export function isAtomic<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Atomic<I, T, Q, S>;

    export function isAtomic<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Atomic<I, T, Q, S> {
      return value instanceof Atomic;
    }
  }

  export const { isAtomic } = Atomic;

  export class Composite<I, T extends Hashable, Q = never, S = T> extends Rule<
    I,
    T,
    Q,
    S
  > {
    public static of<I, T extends Hashable, Q = never, S = T>(properties: {
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
              // We both need to keep with each outcome whether the oracle was used,
              // and with the global sequence whether it was used at all.
              // The second case is needed to decide whether the oracle was used
              // when producing an Inapplicable result (empty sequence).
              // Inapplicable outcomes one are cleared from the sequence.
              Sequence.from(flatten(outcomes)).reduce(
                ([acc, wasUsed], outcome) =>
                  Applicable.isApplicable<I, T, Q, S>(outcome)
                    ? Tuple.of(
                        acc.append(outcome),
                        wasUsed || outcome.isSemiAuto
                      )
                    : Tuple.of(acc, wasUsed || outcome.isSemiAuto),
                Tuple.of(
                  Sequence.empty<Outcome.Applicable<I, T, Q, S>>(),
                  false
                )
              )
            )
            .flatMap<Iterable<Outcome<I, T, Q, S>>>(([targets, oracleUsed]) => {
              if (targets.isEmpty()) {
                return Future.now([
                  Outcome.Inapplicable.of(this, getMode(oracleUsed)),
                ]);
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

    export interface Evaluate<I, T extends Hashable, Q, S> {
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
    export function isComposite<I, T extends Hashable, Q>(
      value: Rule<I, T, Q>
    ): value is Composite<I, T, Q>;

    export function isComposite<I, T extends Hashable, Q>(
      value: unknown
    ): value is Composite<I, T, Q>;

    export function isComposite<I, T extends Hashable, Q>(
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
    TARGET extends Hashable,
    QUESTION,
    SUBJECT,
    TYPE extends Event.Type = Event.Type,
    NAME extends string = string
  > implements Serializable<Event.JSON<TYPE, NAME>>
  {
    public static of<
      INPUT,
      TARGET extends Hashable,
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
      TARGET extends Hashable,
      QUESTION,
      SUBJECT,
      TYPE extends Event.Type = Event.Type,
      NAME extends string = string
    >(
      value: unknown
    ): value is Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
      return value instanceof Event;
    }

    export function start<
      I,
      T extends Hashable,
      Q,
      S,
      N extends string = string
    >(rule: Rule<I, T, Q, S>, name: N): Event<I, T, Q, S, "start", N>;

    export function start<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "start", "total">;

    export function start<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>,
      name: string = "total"
    ): Event<I, T, Q, S, "start"> {
      return Event.of("start", rule, name);
    }

    export function end<I, T extends Hashable, Q, S, N extends string = string>(
      rule: Rule<I, T, Q, S>,
      name: N
    ): Event<I, T, Q, S, "end", N>;

    export function end<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "end", "total">;

    export function end<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>,
      name: string = "total"
    ): Event<I, T, Q, S, "end"> {
      return Event.of("end", rule, name);
    }

    export function startApplicability<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "start", "applicability"> {
      return Event.of("start", rule, "applicability");
    }

    export function endApplicability<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "end", "applicability"> {
      return Event.of("end", rule, "applicability");
    }

    export function startExpectation<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "start", "expectation"> {
      return Event.of("start", rule, "expectation");
    }

    export function endExpectation<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Event<I, T, Q, S, "end", "expectation"> {
      return Event.of("end", rule, "expectation");
    }
  }
}

type Expectation<T> = Either<Tuple<[T, boolean]>, Tuple<[Diagnostic, boolean]>>;

// Processes the expectations of the results of an interview.
// When the result is Passed/Failed (Left), we accumulate the expectations that are later on passed to the Outcome.
// When we encounter the first Diagnostic result of a cantTell (Right),
// the processing stops and later it is passed to the cantTell Outcome.
function processExpectation(
  acc: Expectation<List<[string, Option<Result<Diagnostic>>]>>,
  [id, expectation]: readonly [
    string,
    Expectation<Option.Maybe<Result<Diagnostic>>>
  ]
): Expectation<List<[string, Option<Result<Diagnostic>>]>> {
  return expectation.either(
    ([result, oracleUsed]) =>
      acc.either<Expectation<List<[string, Option<Result<Diagnostic>>]>>>(
        ([accumulator, oracleUsedAccumulator]) =>
          Left.of(
            Tuple.of(
              accumulator.append([
                id,
                Option.isOption(result) ? result : Option.of(result),
              ]),
              oracleUsedAccumulator || oracleUsed
            )
          ),
        ([diagnostic, oracleUsed]) => Right.of(Tuple.of(diagnostic, oracleUsed))
      ),
    ([diagnostic, oracleUsed]) => Right.of(Tuple.of(diagnostic, oracleUsed))
  );
}

function resolve<I, T extends Hashable, Q, S>(
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
  )
    .map((expectations) =>
      reduce(
        expectations,
        processExpectation,
        Left.of(Tuple.of(List.empty(), false))
      )
    )
    .map((expectation) =>
      expectation.either(
        ([expectations, oracleUsed]) =>
          Outcome.from(
            rule,
            target,
            Record.from(expectations),
            getMode(oracleUsed)
          ),
        ([diagnostic, oracleUsed]) =>
          Outcome.CantTell.of(rule, target, diagnostic, getMode(oracleUsed))
      )
    );
}

function getMode(oracleUsed: boolean): Outcome.Mode {
  return oracleUsed ? Outcome.Mode.SemiAuto : Outcome.Mode.Automatic;
}
