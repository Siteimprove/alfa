import { Branched } from "@siteimprove/alfa-branched";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";

import { Cache } from "./cache";
import { Interview } from "./interview";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";

export class Rule<I, T, Q = never, B = never> {
  public static of<I, T, Q = never, B = never>(properties: {
    uri: string;
    evaluate: Rule.Evaluator<I, T, Q, B>;
  }): Rule<I, T, Q, B> {
    return new Rule(properties.uri, properties.evaluate);
  }

  public readonly uri: string;
  public readonly evaluator: Rule.Evaluator<I, T, Q, B>;

  private constructor(uri: string, evaluator: Rule.Evaluator<I, T, Q, B>) {
    this.uri = uri;
    this.evaluator = evaluator;
  }

  public evaluate(
    input: Readonly<I>,
    oracle: Oracle<Q> = () => None,
    outcomes: Cache = Cache.empty()
  ): Branched<Iterable<Outcome<I, T, Q, B>>, B> {
    return this.evaluator(input, oracle, outcomes);
  }

  public toJSON() {
    return {
      uri: this.uri
    };
  }
}

export namespace Rule {
  export interface Expectation<T = boolean> {
    readonly holds: T;
  }

  export interface Expectations<T = boolean> {
    readonly [key: string]: Expectation<T>;
  }

  export type Evaluator<I, T, Q, B> = (
    input: Readonly<I>,
    oracle: Oracle<Q>,
    outcomes: Cache
  ) => Branched<Iterable<Outcome<I, T, Q, B>>, B>;

  export namespace Atomic {
    type Evaluator<I, T, Q, B> = (
      input: Readonly<I>
    ) => {
      applicability(): Iterable<Branched<Interview<Q, T, Option<T>>, B>>;
      expectations(
        target: T,
        branches: Iterable<B>
      ): Expectations<Branched<Interview<Q, T, boolean>, B>>;
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

            return Branched.traverse(applicability(), interview =>
              interview.flatMap((interview, branches) => {
                const target = Option.flatten(
                  Interview.conduct(interview, rule, oracle, branches)
                );

                if (target.isSome()) {
                  return resolve(
                    rule,
                    Record.of(expectations(target.get(), branches)),
                    oracle,
                    branches
                  ).map(expectations => {
                    if (expectations.isSome()) {
                      return Option.of(
                        Outcome.from(
                          rule,
                          target.get(),
                          Record.from(expectations.get())
                        )
                      );
                    }

                    return Option.of(Outcome.CantTell.of(rule, target.get()));
                  });
                }

                return Branched.of(None);
              })
            ).map(outcomes => {
              const applicable = Iterable.reduce(
                outcomes,
                (applicable, outcome) =>
                  outcome.isSome()
                    ? applicable.push(outcome.get())
                    : applicable,
                List.empty<Outcome.Applicable<I, T, Q, B>>()
              );

              if (applicable.size === 0) {
                return [Outcome.Inapplicable.of(rule)];
              }

              return applicable;
            });
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
        branches: Iterable<B>
      ): Expectations<Branched<Interview<Q, T, boolean>, B>>;
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
              (outcomes, branches) => {
                const applicable = Iterable.reduce(
                  outcomes,
                  (applicable, outcome) =>
                    Outcome.isApplicable(outcome)
                      ? applicable.push(outcome)
                      : applicable,
                  List.empty<Outcome.Applicable<I, T, Q, B>>()
                );

                if (applicable.size === 0) {
                  return Branched.of([Outcome.Inapplicable.of(rule)]);
                }

                return Branched.traverse(
                  Iterable.groupBy(applicable, outcome => outcome.target),
                  ([target, outcomes]) =>
                    resolve(
                      rule,
                      Record.of(expectations(outcomes, branches)),
                      oracle,
                      branches
                    ).map(expectations => {
                      if (expectations.isSome()) {
                        return Outcome.from(
                          rule,
                          target,
                          Record.from(expectations.get())
                        );
                      }

                      return Outcome.CantTell.of(rule, target);
                    })
                );
              }
            );
          });
        }
      });

      return rule;
    }
  }

  function resolve<I, T, Q, B>(
    rule: Rule<I, T, Q, B>,
    expectations: Record<Expectations<Branched<Interview<Q, T, boolean>, B>>>,
    oracle: Oracle<Q>,
    branches: Iterable<B>
  ): Branched<Option<List<[string, Expectation]>>, B> {
    return Iterable.reduce(
      expectations,
      (expectations, [id, expectation]) =>
        expectations.flatMap((expectations, branches) =>
          expectation.holds.map(interview =>
            Interview.conduct(interview, rule, oracle, branches).flatMap(
              holds =>
                expectations.map(expectations =>
                  expectations.push([id, { holds }])
                )
            )
          )
        ),
      Branched.of(Option.of(List.empty()))
    );
  }
}
