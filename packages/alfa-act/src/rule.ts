import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Document } from "@siteimprove/alfa-json-ld";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Cache } from "./cache";
import { Interview } from "./interview";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";

const { flatMap, flatten, reduce } = Iterable;

export class Rule<I, T, Q = unknown> {
  public static of<I, T, Q = unknown>(properties: {
    uri: string;
    evaluate: Rule.Evaluator<I, T, Q>;
  }): Rule<I, T, Q> {
    return new Rule(properties.uri, properties.evaluate);
  }

  public readonly uri: string;
  private readonly _evaluator: Rule.Evaluator<I, T, Q>;

  private constructor(uri: string, evaluator: Rule.Evaluator<I, T, Q>) {
    this.uri = uri;
    this._evaluator = evaluator;
  }

  public evaluate(
    input: Readonly<I>,
    oracle: Oracle<Q> = () => Future.now(None),
    outcomes: Cache = Cache.empty()
  ): Future<Iterable<Outcome<I, T, Q>>> {
    return this._evaluator(input, oracle, outcomes);
  }

  public toJSON() {
    return {
      uri: this.uri
    };
  }

  public toEARL(): Document {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#"
      },
      "@type": "earl:TestCase",
      "@id": this.uri
    };
  }
}

export namespace Rule {
  export type Expectation = Result<string, string>;

  export type Evaluator<I, T, Q> = (
    input: Readonly<I>,
    oracle: Oracle<Q>,
    outcomes: Cache
  ) => Future<Iterable<Outcome<I, T, Q>>>;

  export namespace Atomic {
    type Evaluator<I, T, Q> = (
      input: Readonly<I>
    ) => {
      applicability(): Iterable<Interview<Q, T, T | Option<T>>>;
      expectations(target: T): { [key: string]: Interview<Q, T, Expectation> };
    };

    export function of<I, T, Q = unknown>(properties: {
      uri: string;
      evaluate: Evaluator<I, T, Q>;
    }): Rule<I, T, Q> {
      const { uri, evaluate } = properties;

      const rule: Rule<I, T, Q> = Rule.of({
        uri,
        evaluate(input, oracle, outcomes) {
          return outcomes.get(rule, () => {
            const { applicability, expectations } = evaluate(input);

            return Future.traverse(applicability(), interview =>
              Interview.conduct(interview, rule, oracle).map(target =>
                target.flatMap(target =>
                  Option.isOption(target) ? target : Option.of(target)
                )
              )
            )
              .map(targets => Sequence.from(flatten<T>(targets)))
              .flatMap<Iterable<Outcome<I, T, Q>>>(targets => {
                if (targets.isEmpty()) {
                  return Future.now([Outcome.Inapplicable.of(rule)]);
                }

                return Future.traverse(targets, target =>
                  resolve(target, Record.of(expectations(target)), rule, oracle)
                );
              });
          });
        }
      });

      return rule;
    }
  }

  export namespace Composite {
    type Evaluator<I, T, Q> = (
      input: Readonly<I>
    ) => {
      expectations(
        outcomes: Sequence<Outcome.Applicable<I, T, Q>>
      ): { [key: string]: Interview<Q, T, Expectation> };
    };

    export function of<I, T, Q = unknown>(properties: {
      uri: string;
      composes: Iterable<Rule<I, T, Q>>;
      evaluate: Evaluator<I, T, Q>;
    }): Rule<I, T, Q> {
      const { uri, composes, evaluate } = properties;

      const rule: Rule<I, T, Q> = Rule.of({
        uri,
        evaluate(input, oracle, outcomes) {
          return outcomes.get(rule, () => {
            return Future.traverse(composes, rule =>
              rule.evaluate(input, oracle, outcomes)
            )
              .map(outcomes =>
                Sequence.from(
                  flatMap(outcomes, function*(outcomes) {
                    for (const outcome of outcomes) {
                      if (Outcome.isApplicable(outcome)) {
                        yield outcome;
                      }
                    }
                  })
                )
              )
              .flatMap<Iterable<Outcome<I, T, Q>>>(targets => {
                if (targets.isEmpty()) {
                  return Future.now([Outcome.Inapplicable.of(rule)]);
                }

                const { expectations } = evaluate(input);

                return Future.traverse(
                  targets.groupBy(outcome => outcome.target),
                  ([target, outcomes]) =>
                    resolve(
                      target,
                      Record.of(expectations(outcomes)),
                      rule,
                      oracle
                    )
                );
              });
          });
        }
      });

      return rule;
    }
  }
}

function resolve<I, T, Q>(
  target: T,
  expectations: Record<{ [key: string]: Interview<Q, T, Rule.Expectation> }>,
  rule: Rule<I, T, Q>,
  oracle: Oracle<Q>
): Future<Outcome.Applicable<I, T, Q>> {
  return Future.traverse(expectations, ([id, interview]) =>
    Interview.conduct(interview, rule, oracle).map(
      expectation => [id, expectation] as const
    )
  ).map(expectations =>
    reduce(
      expectations,
      (expectations, [id, expectation]) =>
        expectations.flatMap(expectations =>
          expectation.map(expectation =>
            expectations.push([
              id,
              expectation.map(normalize).mapErr(normalize)
            ])
          )
        ),
      Option.of(List.empty<[string, Rule.Expectation]>())
    )
      .map(expectations => {
        return Outcome.from(rule, target, Record.from(expectations));
      })
      .getOrElse(() => {
        return Outcome.CantTell.of(rule, target);
      })
  );
}

function normalize(string: string): string {
  return string.replace(/\s+/g, " ").trim();
}
