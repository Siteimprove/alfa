import {
  // Cache,
  Interview,
  Oracle,
  // Outcome,
  Requirement,
  Tag,
} from "@siteimprove/alfa-act-base";
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
import * as sarif from "@siteimprove/alfa-sarif";

import * as base from "@siteimprove/alfa-act-base";

import { Diagnostic } from "./diagnostic";
import { Outcome } from "./outcome";

const { flatMap, flatten, reduce } = Iterable;

/**
 * @public
 */
export abstract class Rule<I = unknown, T = unknown, Q = never>
  extends base.Rule<I, T, Q>
  implements
    Equatable,
    json.Serializable<base.Rule.JSON>,
    earl.Serializable<Rule.EARL>,
    sarif.Serializable<sarif.ReportingDescriptor> {
  protected constructor(
    uri: string,
    requirements: Array<Requirement>,
    tags: Array<Tag>,
    evaluator: base.Rule.Evaluate<I, T, Q>
  ) {
    super(uri, requirements, tags, evaluator);
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
  export interface JSON<T extends string = string> extends base.Rule.JSON<T> {
    //   [key: string]: json.JSON;
    //   type: string;
    //   uri: string;
    //   requirements: Array<Requirement.JSON>;
    //   tags: Array<Tag.JSON>;
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

  // export type Input<R> = R extends Rule<infer I, any, any> ? I : never;
  //
  // export type Target<R> = R extends Rule<any, infer T, any> ? T : never;
  //
  // export type Question<R> = R extends Rule<any, any, infer Q> ? Q : never;
  //
  // export function isRule<I, T, Q>(value: unknown): value is Rule<I, T, Q> {
  //   return value instanceof Rule;
  // }

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
  // export interface Evaluate<I, T, Q> {
  //   (input: Readonly<I>, oracle: Oracle<I, T, Q>, outcomes: Cache): Future<
  //     Iterable<Outcome<I, T, Q>>
  //   >;
  // }

  export class Atomic<I = unknown, T = unknown, Q = never> extends Rule<
    I,
    T,
    Q
  > {
    public static of<I, T = unknown, Q = never>(properties: {
      uri: string;
      requirements?: Iterable<Requirement>;
      tags?: Iterable<Tag>;
      evaluate: Atomic.Evaluate<I, T, Q>;
    }): Atomic<I, T, Q> {
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
      evaluate: Atomic.Evaluate<I, T, Q>
    ) {
      super(uri, requirements, tags, (input, oracle, outcomes) =>
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
        requirements: this._requirements.map((requirement) =>
          requirement.toJSON()
        ),
        tags: this._tags.map((tag) => tag.toJSON()),
      };
    }
  }

  export namespace Atomic {
    export interface JSON extends Rule.JSON<"atomic"> {}

    export interface Evaluate<I, T, Q> {
      (input: Readonly<I>): {
        applicability(): Iterable<Interview<Q, T, Option.Maybe<T>>>;
        expectations(
          target: T
        ): {
          [key: string]: Interview<Q, T, Option.Maybe<Result<Diagnostic>>>;
        };
      };
    }
  }

  export function isAtomic<I, T, Q>(
    value: Rule<I, T, Q>
  ): value is Atomic<I, T, Q>;

  export function isAtomic<I, T, Q>(value: unknown): value is Atomic<I, T, Q>;

  export function isAtomic<I, T, Q>(value: unknown): value is Atomic<I, T, Q> {
    return value instanceof Atomic;
  }

  export class Composite<I = unknown, T = unknown, Q = never> extends Rule<
    I,
    T,
    Q
  > {
    public static of<I, T = unknown, Q = never>(properties: {
      uri: string;
      requirements?: Iterable<Requirement>;
      tags?: Iterable<Tag>;
      composes: Iterable<Rule<I, T, Q>>;
      evaluate: Composite.Evaluate<I, T, Q>;
    }): Composite<I, T, Q> {
      return new Composite(
        properties.uri,
        Array.from(properties.requirements ?? []),
        Array.from(properties.tags ?? []),
        Array.from(properties.composes),
        properties.evaluate
      );
    }

    private readonly _composes: Array<Rule<I, T, Q>>;

    private constructor(
      uri: string,
      requirements: Array<Requirement>,
      tags: Array<Tag>,
      composes: Array<Rule<I, T, Q>>,
      evaluate: Composite.Evaluate<I, T, Q>
    ) {
      super(uri, requirements, tags, (input, oracle, outcomes) =>
        outcomes.get(this, () =>
          Future.traverse(this._composes, (rule) =>
            rule.evaluate(input, oracle, outcomes)
          )
            .map((outcomes) =>
              Sequence.from(
                flatMap(outcomes, function* (outcomes) {
                  for (const outcome of outcomes) {
                    if (Outcome.isApplicable<I, T, Q>(outcome)) {
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

      this._composes = composes;
    }

    public get composes(): ReadonlyArray<Rule<I, T, Q>> {
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
    export interface JSON extends Rule.JSON<"composite"> {
      composes: Array<Rule.JSON>;
    }

    export interface Evaluate<I, T, Q> {
      (input: Readonly<I>): {
        expectations(
          outcomes: Sequence<Outcome.Applicable<I, T, Q>>
        ): {
          [key: string]: Interview<Q, T, Option.Maybe<Result<Diagnostic>>>;
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

  export class Inventory<I = unknown, T = unknown> extends Rule<I, T, never> {
    public static of<I, T = unknown>(properties: {
      uri: string;
      evaluate: Inventory.Evaluate<I, T>;
    }): Inventory<I, T> {
      return new Inventory(properties.uri, properties.evaluate);
    }

    private constructor(uri: string, evaluate: Inventory.Evaluate<I, T>) {
      super(uri, [], [], (input) => {
        const { applicability, expectations } = evaluate(input);

        return Future.traverse(applicability(), (target) =>
          Future.now(Outcome.inventory(this, target, expectations(target)))
        );
      });
    }

    public toJSON(): Inventory.JSON {
      return {
        type: "inventory",
        uri: this._uri,
        requirements: [],
        tags: [],
      };
    }
  }

  export namespace Inventory {
    export interface JSON extends Rule.JSON<"inventory"> {}

    export interface Evaluate<I, T> {
      (input: Readonly<I>): {
        applicability(): Iterable<T>;
        expectations(target: T): base.Diagnostic;
      };
    }
  }
}

function resolve<I, T, Q>(
  target: T,
  expectations: Record<{
    [key: string]: Interview<Q, T, Option.Maybe<Result<Diagnostic>>>;
  }>,
  rule: Rule<I, T, Q>,
  oracle: Oracle<I, T, Q>
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
