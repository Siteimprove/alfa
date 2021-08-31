import { Diagnostic, Tag } from "@siteimprove/alfa-act-base";
import { Array } from "@siteimprove/alfa-array";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as base from "@siteimprove/alfa-act-base";
import * as earl from "@siteimprove/alfa-earl";

import { Cache } from "./cache";
import { Interview } from "./interview";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Requirement } from "./requirement";

const { flatMap, flatten, reduce } = Iterable;

/**
 * @public
 */
export abstract class Rule<I = unknown, T = unknown, Q = never, S = T>
  extends base.Rule<I, T, Q, S>
  implements earl.Serializable<Rule.EARL>
{
  protected readonly _requirements: Array<Requirement>;
  protected readonly _evaluate: Rule.Evaluate<I, T, Q, S>;

  protected constructor(
    uri: string,
    requirements: Array<Requirement>,
    tags: Array<Tag>,
    evaluator: Rule.Evaluate<I, T, Q, S>
  ) {
    super(uri, tags, evaluator);
    this._requirements = requirements;
    this._evaluate = evaluator;
  }

  public get requirements(): ReadonlyArray<Requirement> {
    return this._requirements;
  }

  public hasRequirement(requirement: Requirement): boolean {
    return Array.includes(this._requirements, requirement);
  }

  public evaluate(
    input: I,
    oracle: Oracle<I, T, Q, S> = () => Future.now(None),
    outcomes: Cache = Cache.empty()
  ): Future<Iterable<Outcome<I, T, Q, S>>> {
    return this._evaluate(input, oracle, outcomes);
  }

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
}

/**
 * @public
 */
export namespace Rule {
  export interface JSON extends base.Rule.JSON {}

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
  export interface Evaluate<I, T, Q, S> {
    (input: Readonly<I>, oracle?: Oracle<I, T, Q, S>, outcomes?: Cache): Future<
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
      // function evaluator(input: Readonly<I>, oracle: Oracle<I, T, Q, S> = () => Future.now(None), outcomes: Cache = Cache.empty()):

      super(uri, requirements, tags, (input, oracle, outcomes) => {
        outcomes = outcomes ?? Cache.empty();
        const myOracle = oracle ?? (() => Future.now(None));
        return outcomes.get(this, () => {
          const { applicability, expectations } = evaluate(input);

          return Future.traverse(applicability(), (interview) =>
            Interview.conduct(interview, this, myOracle).map((target) =>
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
                resolve(target, Record.of(expectations(target)), this, myOracle)
              );
            });
        });
      });
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
    export interface JSON extends base.Rule.JSON {
      type: "atomic";
      requirements: Array<Requirement.JSON>;
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
      super(uri, requirements, tags, (input, oracle, outcomes) => {
        outcomes = outcomes ?? Cache.empty();
        const myOracle = oracle ?? (() => Future.now(None));
        return outcomes.get(this, () =>
          Future.traverse(this._composes, (rule) =>
            rule.evaluate(input, myOracle, outcomes)
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
                    myOracle
                  )
              );
            })
        );
      });

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
    export interface JSON extends base.Rule.JSON {
      type: "composite";
      composes: Array<base.Rule.JSON>;
      requirements: Array<Requirement.JSON>;
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
