import {
  Diagnostic,
  Oracle,
  Requirement,
  Tag,
} from "@siteimprove/alfa-act-base";
import { Array } from "@siteimprove/alfa-array";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as base from "@siteimprove/alfa-act-base";

import { Interview } from "./interview";
import { Outcome } from "./outcome";

const { flatMap, flatten, reduce } = Iterable;

/**
 * @public
 */
export namespace Rule {
  export class Atomic<
    I = unknown,
    T = unknown,
    Q = never,
    S = T
  > extends base.Rule<I, T, Q, S> {
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
            .flatMap<Iterable<base.Outcome<I, T, Q, S>>>((targets) => {
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
    export interface JSON extends base.Rule.JSON {
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
    value: base.Rule<I, T, Q, S>
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
  > extends base.Rule<I, T, Q, S> {
    public static of<I, T = unknown, Q = never, S = T>(properties: {
      uri: string;
      requirements?: Iterable<Requirement>;
      tags?: Iterable<Tag>;
      composes: Iterable<base.Rule<I, T, Q, S>>;
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

    private readonly _composes: Array<base.Rule<I, T, Q, S>>;

    private constructor(
      uri: string,
      requirements: Array<Requirement>,
      tags: Array<Tag>,
      composes: Array<base.Rule<I, T, Q, S>>,
      evaluate: Composite.Evaluate<I, T, Q, S>
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
                    if (Outcome.isApplicable(outcome)) {
                      yield outcome;
                    }
                  }
                })
              )
            )
            .flatMap<Iterable<base.Outcome<I, T, Q, S>>>((targets) => {
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

    public get composes(): ReadonlyArray<base.Rule<I, T, Q, S>> {
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
      uri: string;
      composes: Array<base.Rule.JSON>;
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
    value: base.Rule<I, T, Q>
  ): value is Composite<I, T, Q>;

  export function isComposite<I, T, Q>(
    value: unknown
  ): value is Composite<I, T, Q>;

  export function isComposite<I, T, Q>(
    value: unknown
  ): value is Composite<I, T, Q> {
    return value instanceof Composite;
  }

  export class Inventory<I = unknown, T = unknown> extends base.Rule<
    I,
    T,
    never
  > {
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
    export interface JSON extends base.Rule.JSON {
      type: "inventory";
    }

    export interface Evaluate<I, T> {
      (input: Readonly<I>): {
        applicability(): Iterable<T>;
        expectations(target: T): Diagnostic;
      };
    }
  }
}

function resolve<I, T, Q, S>(
  target: T,
  expectations: Record<{
    [key: string]: Interview<Q, S, T, Option.Maybe<Result<Diagnostic>>>;
  }>,
  rule: base.Rule<I, T, Q, S>,
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
