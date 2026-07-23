import { Array } from "@siteimprove/alfa-array";
import type { Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Maybe } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import type { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Tuple } from "@siteimprove/alfa-tuple";

import * as json from "@siteimprove/alfa-json";

import type { Diagnostic, Interview, Question } from "../expectation/index.ts";
import type { Requirement, Tag } from "../metadata/index.ts";
import { Outcome } from "../outcome.ts";

import { evaluate as evaluateRule } from "./evaluation.ts";
import { RulePerformance } from "./rule-performance.ts";
import { Rule } from "./rule.ts";

const { flatten } = Iterable;
const { Applicable } = Outcome;

/**
 * @public
 */
export class Composite<
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
    composes: Iterable<Rule<I, T, Q, S>>;
    evaluate: Composite.Evaluate<I, T, Q, S>;
  }): Composite<I, T, Q, S> {
    return new Composite(
      properties.uri,
      Array.from(properties.requirements ?? []),
      Array.from(properties.tags ?? []),
      Array.from(properties.composes),
      properties.evaluate,
    );
  }

  private readonly _composes: Array<Rule<I, T, Q, S>>;

  protected constructor(
    uri: string,
    requirements: Array<Requirement>,
    tags: Array<Tag>,
    composes: Array<Rule<I, T, Q, S>>,
    evaluate: Composite.Evaluate<I, T, Q, S>,
  ) {
    super(uri, requirements, tags, (input, oracle, outcomes, performance) =>
      evaluateRule(
        this,
        oracle,
        outcomes,
        performance,
        async (rulePerformance) => {
          const evaluated = await Promise.all(
            this._composes.map((rule) =>
              rule.evaluate(input, oracle, outcomes, performance),
            ),
          );

          // We both need to keep with each outcome whether the oracle was used,
          // and with the global sequence whether it was used at all.
          // The second case is needed to decide whether the oracle was used
          // when producing an Inapplicable result (empty sequence).
          // Inapplicable outcomes one are cleared from the sequence.
          //
          // For efficiency, we prepend the targets and reverse the full
          // sequence later to conserve the order.
          // This result in a O(n) rather than O(n²) process.
          const [targets, oracleUsed] = Sequence.from(
            flatten(evaluated),
          ).reduce(
            ([acc, wasUsed], outcome) =>
              Tuple.of(
                Applicable.isApplicable<I, T, Q, S>(outcome)
                  ? acc.prepend(outcome)
                  : acc,
                wasUsed || outcome.isSemiAuto,
              ),
            Tuple.of(Sequence.empty<Outcome.Applicable<I, T, Q, S>>(), false),
          );

          if (targets.isEmpty()) {
            return { items: Sequence.empty(), oracleUsed };
          }

          const { expectations } = evaluate(input, rulePerformance);

          // Since targets were prepended when Applicability was processed, we now
          // need to reverse the sequence to restore initial order.
          const items = Sequence.from(
            Array.from(
              targets.reverse().groupBy((outcome) => outcome.target),
            ).map(([target, outcomes]) => ({
              target,
              expectations: Record.of(expectations(outcomes)),
              oracleUsed,
            })),
          );

          return { items, oracleUsed };
        },
      ),
    );

    this._composes = composes;
  }

  public get composes(): ReadonlyArray<Rule<I, T, Q, S>> {
    return this._composes;
  }

  public toJSON(options: {
    verbosity: json.Serializable.Verbosity.Minimal;
  }): Rule.MinimalJSON;

  public toJSON(): Composite.JSON;

  public toJSON(
    options?: json.Serializable.Options,
  ): Rule.MinimalJSON | Composite.JSON;

  public toJSON(
    options?: json.Serializable.Options,
  ): Rule.MinimalJSON | Composite.JSON {
    return options?.verbosity === json.Serializable.Verbosity.Minimal
      ? { uri: this._uri }
      : {
          type: "composite",
          uri: this._uri,
          requirements: this._requirements.map((requirement) =>
            requirement.toJSON(),
          ),
          tags: this._tags.map((tag) => tag.toJSON()),
          composes: this._composes.map((rule) => rule.toJSON(options)),
        };
  }
}

/**
 * @public
 */
export namespace Composite {
  export interface JSON extends Rule.JSON {
    type: "composite";
    uri: string;
    composes: Array<Rule.JSON>;
  }

  export interface Evaluate<
    I,
    T extends Hashable,
    Q extends Question.Metadata,
    S,
  > {
    (
      input: I,
      performance?: RulePerformance<I, T, Q, S>,
    ): {
      expectations(outcomes: Sequence<Outcome.Applicable<I, T, Q, S>>): {
        [key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic>>>;
      };
    };
  }

  export function isComposite<
    I,
    T extends Hashable,
    Q extends Question.Metadata,
  >(value: unknown): value is Composite<I, T, Q> {
    return value instanceof Composite;
  }
}
