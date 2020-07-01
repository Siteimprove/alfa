import { Equatable } from "@siteimprove/alfa-equatable";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";

import { Cache } from "./cache";
import { Diagnostic } from "./diagnostic";
import { Interview } from "./interview";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";

const { flatMap, flatten, reduce } = Iterable;

export abstract class Rule<I, T = unknown, Q = never>
  implements Equatable, json.Serializable, earl.Serializable {
  protected readonly _uri: string;
  protected readonly _evaluate: Rule.Evaluate<I, T, Q>;

  protected constructor(uri: string, evaluator: Rule.Evaluate<I, T, Q>) {
    this._uri = uri;
    this._evaluate = evaluator;
  }

  public get uri(): string {
    return this._uri;
  }

  public evaluate(
    input: Readonly<I>,
    oracle: Oracle<Q> = () => Future.now(None),
    outcomes: Cache = Cache.empty()
  ): Future<Iterable<Outcome<I, T, Q>>> {
    return this._evaluate(input, oracle, outcomes);
  }

  public equals(value: unknown): value is this {
    return value instanceof Rule && value._uri === this._uri;
  }

  public abstract toJSON(): Rule.JSON;

  public toEARL(): Rule.EARL {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
      },
      "@type": ["earl:TestCriterion", "earl:TestCase"],
      "@id": this._uri,
    };
  }
}

export namespace Rule {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
    uri: string;
  }

  export interface EARL extends earl.EARL {
    "@type": ["earl:TestCriterion", "earl:TestCase"];
    "@id": string;
  }

  export function isRule<I, T, Q>(value: unknown): value is Rule<I, T, Q> {
    return value instanceof Rule;
  }

  /**
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
    (input: Readonly<I>, oracle: Oracle<Q>, outcomes: Cache): Future<
      Iterable<Outcome<I, T, Q>>
    >;
  }

  export class Atomic<I, T = unknown, Q = never> extends Rule<I, T, Q> {
    public static of<I, T = unknown, Q = never>(properties: {
      uri: string;
      evaluate: Atomic.Evaluate<I, T, Q>;
    }): Atomic<I, T, Q> {
      return new Atomic(properties.uri, properties.evaluate);
    }

    private constructor(uri: string, evaluate: Atomic.Evaluate<I, T, Q>) {
      super(uri, (input, oracle, outcomes) =>
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
            .flatMap<Iterable<Outcome<I, T, Q>>>((targets) => {
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

    public toJSON(): Atomic.JSON {
      return {
        type: "atomic",
        uri: this._uri,
      };
    }
  }

  export namespace Atomic {
    export interface JSON extends Rule.JSON {
      type: "atomic";
    }

    export interface Evaluate<I, T, Q> {
      (input: Readonly<I>): {
        applicability(): Iterable<Interview<Q, T, Option.Maybe<T>>>;
        expectations(
          target: T
        ): { [key: string]: Interview<Q, T, Option<Result<Diagnostic>>> };
      };
    }
  }

  export function isAtomic<I, T, Q>(value: unknown): value is Atomic<I, T, Q> {
    return value instanceof Atomic;
  }

  export class Composite<I, T = unknown, Q = never> extends Rule<I, T, Q> {
    public static of<I, T = unknown, Q = never>(properties: {
      uri: string;
      composes: Iterable<Rule<I, T, Q>>;
      evaluate: Composite.Evaluate<I, T, Q>;
    }): Composite<I, T, Q> {
      return new Composite(
        properties.uri,
        properties.composes,
        properties.evaluate
      );
    }

    private readonly _composes: Array<Rule<I, T, Q>>;

    private constructor(
      uri: string,
      composes: Iterable<Rule<I, T, Q>>,
      evaluate: Composite.Evaluate<I, T, Q>
    ) {
      super(uri, (input, oracle, outcomes) =>
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
            .flatMap<Iterable<Outcome<I, T, Q>>>((targets) => {
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

      this._composes = Array.from(composes);
    }

    public get composes(): Iterable<Rule<I, T, Q>> {
      return this._composes;
    }

    public toJSON(): Composite.JSON {
      return {
        type: "composite",
        uri: this._uri,
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

    export interface Evaluate<I, T, Q> {
      (input: Readonly<I>): {
        expectations(
          outcomes: Sequence<Outcome.Applicable<I, T, Q>>
        ): { [key: string]: Interview<Q, T, Option<Result<Diagnostic>>> };
      };
    }
  }

  export function isComposite<I, T, Q>(
    value: unknown
  ): value is Composite<I, T, Q> {
    return value instanceof Composite;
  }
}

function resolve<I, T, Q>(
  target: T,
  expectations: Record<{
    [key: string]: Interview<Q, T, Option<Result<Diagnostic>>>;
  }>,
  rule: Rule<I, T, Q>,
  oracle: Oracle<Q>
): Future<Outcome.Applicable<I, T, Q>> {
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
            expectations.append([id, expectation])
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
