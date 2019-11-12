import { Iterable } from "@siteimprove/alfa-iterable";
import { Document } from "@siteimprove/alfa-json-ld";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";

import { Cache } from "./cache";
import { Interview } from "./interview";
import { Oracle } from "./oracle";
import { Outcome } from "./outcome";

export class Rule<I, T, Q = never> {
  public static of<I, T, Q = never>(properties: {
    uri: string;
    evaluate: Rule.Evaluator<I, T, Q>;
  }): Rule<I, T, Q> {
    return new Rule(properties.uri, properties.evaluate);
  }

  public readonly uri: string;
  private readonly evaluator: Rule.Evaluator<I, T, Q>;

  private constructor(uri: string, evaluator: Rule.Evaluator<I, T, Q>) {
    this.uri = uri;
    this.evaluator = evaluator;
  }

  public evaluate(
    input: Readonly<I>,
    oracle: Oracle<Q> = () => None,
    outcomes: Cache = Cache.empty()
  ): Iterable<Outcome<I, T, Q>> {
    return this.evaluator(input, oracle, outcomes);
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
  ) => Iterable<Outcome<I, T, Q>>;

  export namespace Atomic {
    type Evaluator<I, T, Q> = (
      input: Readonly<I>
    ) => {
      applicability(): Iterable<Interview<Q, T, T | Option<T>>>;
      expectations(target: T): { [key: string]: Interview<Q, T, Expectation> };
    };

    export function of<I, T, Q = never>(properties: {
      uri: string;
      evaluate: Evaluator<I, T, Q>;
    }): Rule<I, T, Q> {
      const { uri, evaluate } = properties;

      const rule: Rule<I, T, Q> = Rule.of({
        uri,
        evaluate(input, oracle, outcomes) {
          return outcomes.get(rule, () => {
            const { applicability, expectations } = evaluate(input);

            const targets = Array.from(
              Iterable.flatMap(applicability(), function*(interview) {
                for (const target of Interview.conduct(
                  interview,
                  rule,
                  oracle
                ).flatMap(target =>
                  Option.isOption(target) ? target : Option.of(target)
                )) {
                  yield target;
                }
              })
            );

            if (targets.length === 0) {
              return [Outcome.Inapplicable.of(rule)];
            }

            return targets.map(target =>
              resolve(target, Record.of(expectations(target)), rule, oracle)
            );
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
        outcomes: Iterable<Outcome.Applicable<I, T, Q>>
      ): { [key: string]: Interview<Q, T, Expectation> };
    };

    export function of<I, T, Q = never>(properties: {
      uri: string;
      composes: Iterable<Rule<I, T, Q>>;
      evaluate: Evaluator<I, T, Q>;
    }): Rule<I, T, Q> {
      const { uri, composes, evaluate } = properties;

      const rule: Rule<I, T, Q> = Rule.of({
        uri,
        evaluate(input, oracle, outcomes) {
          return outcomes.get(rule, () => {
            const targets = Array.from(
              Iterable.flatMap(composes, function*(rule) {
                for (const outcome of rule.evaluate(input, oracle, outcomes)) {
                  if (Outcome.isApplicable(outcome)) {
                    yield outcome;
                  }
                }
              })
            );

            if (targets.length === 0) {
              return [Outcome.Inapplicable.of(rule)];
            }

            const { expectations } = evaluate(input);

            return Array.from(
              Iterable.map(
                Iterable.groupBy(targets, outcome => outcome.target),
                ([target, outcomes]) =>
                  resolve(
                    target,
                    Record.of(expectations(outcomes)),
                    rule,
                    oracle
                  )
              )
            );
          });
        }
      });

      return rule;
    }
  }

  function resolve<I, T, Q>(
    target: T,
    expectations: Record<{ [key: string]: Interview<Q, T, Expectation> }>,
    rule: Rule<I, T, Q>,
    oracle: Oracle<Q>
  ): Outcome.Applicable<I, T, Q> {
    return Iterable.reduce(
      expectations,
      (expectations, [id, interview]) => {
        return expectations.flatMap((expectations, branches) =>
          Interview.conduct(interview, rule, oracle).map(expectation =>
            expectations.push([id, expectation])
          )
        );
      },
      Option.of(List.empty<[string, Expectation]>())
    )
      .map(expectations => {
        return Outcome.from(rule, target, Record.from(expectations));
      })
      .getOrElse(() => {
        return Outcome.CantTell.of(rule, target);
      });
  }
}
