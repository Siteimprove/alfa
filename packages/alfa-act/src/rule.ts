import { Branched } from "@siteimprove/alfa-branched";
import { Cache } from "@siteimprove/alfa-cache";
import { Equality } from "@siteimprove/alfa-equality";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";

import { Oracle } from "./oracle";
import { Outcome } from "./outcome";
import { Question } from "./question";

export class Rule<I, T, Q = never, B = never> {
  public static of<I, T, Q = never, B = never>(properties: {
    uri: string;
    evaluate: Rule.Evaluator<I, T, Q, B>;
  }): Rule<I, T, Q, B> {
    return new Rule(properties.uri, properties.evaluate);
  }

  public readonly uri: string;
  public readonly evaluate: Rule.Evaluator<I, T, Q, B>;

  private constructor(uri: string, evaluator: Rule.Evaluator<I, T, Q, B>) {
    this.uri = uri;
    this.evaluate = evaluator;
  }

  public toJSON() {
    return {
      uri: this.uri
    };
  }
}

export namespace Rule {
  export class Target<A, T> implements Equality<Target<A, T>> {
    public static of<A, T>(aspect: A, target: T): Target<A, T> {
      return new Target(aspect, target);
    }

    public readonly aspect: A;
    public readonly target: T;

    private constructor(aspect: A, target: T) {
      this.aspect = aspect;
      this.target = target;
    }

    public equals(value: unknown): value is Target<A, T> {
      return (
        value instanceof Target &&
        Equality.equals(value.aspect, this.aspect) &&
        Equality.equals(value.target, this.target)
      );
    }

    public toJSON() {
      return {
        aspect: this.aspect,
        target: this.target
      };
    }
  }

  export type Applicability<I, T> = Iterable<Target<Aspect<I>, T>>;

  export interface Expectation {
    readonly holds: boolean;
  }

  export class Expectations<N extends number = number>
    implements Iterable<[N, Expectation]>, Equality<Expectations<N>> {
    public static of<N extends number>(
      expectations: Record<N, Expectation>
    ): Expectations<N> {
      return new Expectations(expectations);
    }

    private readonly expectations: Record<N, Expectation>;

    private constructor(expectations: Record<N, Expectation>) {
      this.expectations = expectations;
    }

    public equals(value: unknown): value is Expectations<N> {
      return value instanceof Expectations;
    }

    public *[Symbol.iterator](): Iterator<[N, Expectation]> {
      for (const key in this.expectations) {
        yield [+key as N, this.expectations[key]];
      }
    }

    public toJSON() {
      return { ...this.expectations };
    }
  }

  export type Aspect<T> = T | T[keyof T];

  export type Evaluator<I, T, Q, B> = (
    input: Readonly<I>,
    oracle: Oracle<Q>,
    outcomes: Cache<
      Rule<I, T, Q, B>,
      Branched<Iterable<Outcome<I, T, Q, B>>, B>
    >
  ) => Branched<Iterable<Outcome<I, T, Q, B>>, B>;

  export namespace Atomic {
    type Questionnaire<A, T, Q> =
      | Expectations
      | {
          [K in keyof Q]: Question<
            K,
            Q[K],
            Target<A, T>,
            Questionnaire<A, T, Q>
          >;
        }[keyof Q];

    type Evaluator<I, T, Q, B> = (
      input: Readonly<I>
    ) => {
      applicability(): Branched<Applicability<I, T>, B>;
      expectations(
        target: Target<Aspect<I>, T>,
        branches: Option<Iterable<B>>
      ): Branched<Questionnaire<Aspect<I>, T, Q>, B>;
    };

    export function of<I, T, Q = never, B = never>(properties: {
      uri: string;
      evaluate: Evaluator<I, T, Q, B>;
    }): Rule<I, T, Q, B> {
      const { uri, evaluate } = properties;

      const rule: Rule<I, T, Q, B> = Rule.of({
        uri,
        evaluate(input, oracle, outcomes) {
          return outcomes.get(rule, () => {
            const { applicability, expectations } = evaluate(input);

            return applicability().flatMap<Iterable<Outcome<I, T, Q, B>>>(
              (applicability, branches) => {
                const targets = [...applicability];

                if (targets.length === 0) {
                  return Branched.of([Outcome.Inapplicable.of(rule)]);
                }

                return Branched.sequence(
                  Iterable.map(targets, target =>
                    expectations(target, branches).map(
                      (expectations, branches) => {
                        while (expectations instanceof Question) {
                          const question = expectations;

                          const answer = oracle(rule, question, branches);

                          if (answer.isSome()) {
                            expectations = answer.get();
                          } else {
                            return Outcome.CantTell.of(rule, target);
                          }
                        }

                        return Outcome.from(rule, target, expectations);
                      }
                    )
                  )
                );
              }
            );
          });
        }
      });

      return rule;
    }
  }

  export namespace Composite {
    type Evaluator<I, T, Q, B> = (
      input: Readonly<I>
    ) => {
      expectations(
        outcomes: Iterable<Outcome<I, T, Q, B>>,
        branches: Option<Iterable<B>>
      ): Branched<Expectations, B>;
    };

    export function of<I, T, Q = never, B = never>(properties: {
      uri: string;
      composes: Iterable<Rule<I, T, Q, B>>;
      evaluate: Evaluator<I, T, Q, B>;
    }): Rule<I, T, Q, B> {
      const { uri, composes, evaluate } = properties;

      const rule: Rule<I, T, Q, B> = Rule.of({
        uri,
        evaluate(input, oracle, outcomes) {
          return outcomes.get(rule, () => {
            const applicability = Branched.sequence(
              Iterable.map(composes, rule =>
                rule.evaluate(input, oracle, outcomes)
              )
            ).map(Iterable.flatten);

            const { expectations } = evaluate(input);

            return applicability.flatMap<Iterable<Outcome<I, T, Q, B>>>(
              (applicability, branches) => {
                const targets = [
                  ...Iterable.filter(
                    applicability,
                    (outcome): outcome is Outcome.Applicable<I, T, Q, B> =>
                      Outcome.isApplicable(outcome)
                  )
                ];

                if (targets.length === 0) {
                  return Branched.of([Outcome.Inapplicable.of(rule)]);
                }

                return Branched.sequence(
                  Iterable.map(
                    Iterable.groupBy(targets, outcome => outcome.target),
                    ([target, outcomes]) =>
                      expectations(outcomes, branches).map(expectations =>
                        Outcome.from(rule, target, expectations)
                      )
                  )
                );
              }
            );
          });
        }
      });

      return rule;
    }
  }
}
