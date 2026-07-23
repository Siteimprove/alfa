import { Array } from "@siteimprove/alfa-array";
import type { Hashable } from "@siteimprove/alfa-hash";
import { Maybe, None } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import type { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Tuple } from "@siteimprove/alfa-tuple";

import * as json from "@siteimprove/alfa-json";

import type { Diagnostic, Question } from "../expectation/index.ts";
import { Interview } from "../expectation/index.ts";
import type { Requirement, Tag } from "../metadata/index.ts";

import { evaluate as evaluateRule } from "./evaluation.ts";
import type { Instrument } from "./instrument.ts";
import { Rule } from "./rule.ts";

/**
 * @public
 */
export class Atomic<
  I,
  T extends Hashable,
  Q extends Question.Metadata = {},
  S = T,
> extends Rule<I, T, Q, S> {
  public static of<
    I,
    T extends Hashable,
    Q extends Question.Metadata = {},
    S = T,
  >(properties: {
    uri: string;
    requirements?: Iterable<Requirement>;
    tags?: Iterable<Tag>;
    evaluate: Atomic.Evaluate<I, T, Q, S>;
  }): Atomic<I, T, Q, S> {
    return new Atomic(
      properties.uri,
      Array.from(properties.requirements ?? []),
      Array.from(properties.tags ?? []),
      properties.evaluate,
    );
  }

  protected constructor(
    uri: string,
    requirements: Array<Requirement>,
    tags: Array<Tag>,
    evaluate: Atomic.Evaluate<I, T, Q, S>,
  ) {
    super(uri, requirements, tags, (input, oracle, outcomes, performance) =>
      evaluateRule(
        this,
        oracle,
        outcomes,
        performance,
        async (instrument) => {
          const { applicability, expectations } = evaluate(input, instrument);

          // We both need to keep with each target whether the oracle was used,
          // and with the global sequence whether it was used at all.
          // The second case is needed to decide whether the oracle was used
          // when producing an Inapplicable result (empty sequence).
          // None are cleared from the sequence, and Some are opened to only
          // keep the targets.
          //
          // For efficiency, we prepend the targets and reverse the full
          // sequence later to conserve the order.
          // This result in a O(n) rather than O(n²) process.
          const [targets, oracleUsed] = await instrument.phase(
            "applicability",
            async () => {
              const conducted = await Promise.all(
                Array.from(applicability()).map((interview) =>
                  Interview.conduct(interview, this, oracle).then((target) =>
                    target.either(
                      // We have a target, wrap it properly and return it.
                      ([target, oracleUsed]) =>
                        Tuple.of(Maybe.toOption(target), oracleUsed),
                      // We have an unanswered question and return None
                      ([_, oracleUsed]) => Tuple.of(None, oracleUsed),
                    ),
                  ),
                ),
              );

              return Sequence.from(conducted).reduce(
                ([acc, wasUsed], [cur, isUsed]) =>
                  Tuple.of(
                    cur.isSome()
                      ? acc.prepend(Tuple.of(cur.get(), isUsed))
                      : acc,
                    wasUsed || isUsed,
                  ),
                Tuple.of(Sequence.empty<Tuple<[T, boolean]>>(), false),
              );
            },
          );

          if (targets.isEmpty()) {
            return { items: Sequence.empty(), oracleUsed };
          }

          // Since targets were prepended when Applicability was processed, we now
          // need to reverse the sequence to restore initial order.
          const items = targets
            .reverse()
            .map(([target, oracleUsedInApplicability]) => ({
              target,
              expectations: Record.of(expectations(target)),
              oracleUsed: oracleUsedInApplicability,
            }));

          // The resolve stage is timed as the "expectation" phase.
          return { items, oracleUsed, resolvePhase: "expectation" };
        },
      ),
    );
  }

  public toJSON(options: {
    verbosity: json.Serializable.Verbosity.Minimal;
  }): Rule.MinimalJSON;

  public toJSON(): Atomic.JSON;

  public toJSON(
    options?: json.Serializable.Options,
  ): Rule.MinimalJSON | Atomic.JSON;

  public toJSON(
    options?: json.Serializable.Options,
  ): Rule.MinimalJSON | Atomic.JSON {
    return options?.verbosity === json.Serializable.Verbosity.Minimal
      ? { uri: this._uri }
      : {
          type: "atomic",
          uri: this._uri,
          requirements: this._requirements.map((requirement) =>
            requirement.toJSON(),
          ),
          tags: this._tags.map((tag) => tag.toJSON()),
        };
  }
}

/**
 * @public
 */
export namespace Atomic {
  export interface JSON extends Rule.JSON {
    type: "atomic";
  }

  export interface Evaluate<
    I,
    T extends Hashable,
    Q extends Question.Metadata,
    S,
  > {
    (
      input: I,
      instrument?: Instrument<I, T, Q, S>,
    ): {
      applicability(): Iterable<Interview<Q, S, T, Maybe<T>>>;
      expectations(target: T): {
        [key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic>>>;
      };
    };
  }

  export function isAtomic<
    I,
    T extends Hashable,
    Q extends Question.Metadata,
    S,
  >(value: unknown): value is Atomic<I, T, Q, S> {
    return value instanceof Atomic;
  }
}
