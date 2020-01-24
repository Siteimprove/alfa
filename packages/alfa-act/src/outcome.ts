import { Equatable } from "@siteimprove/alfa-equatable";
import { Record } from "@siteimprove/alfa-record";
import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";

import { Predicate, Trilean, every } from "@siteimprove/alfa-trilean";

import { Rule } from "./rule";

export abstract class Outcome<I, T, Q = unknown>
  implements Equatable, json.Serializable, earl.Serializable {
  public readonly rule: Rule<I, T, Q>;
  public readonly target?: T;

  protected constructor(rule: Rule<I, T, Q>) {
    this.rule = rule;
  }

  public abstract equals(value: unknown): value is this;

  public abstract toJSON(): Outcome.JSON;

  public toEARL(): Outcome.EARL {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#"
      },
      "@type": "earl:Assertion",
      "earl:test": {
        "@id": this.rule.uri
      }
    };
  }
}

export namespace Outcome {
  export interface JSON {
    [key: string]: json.JSON;
    outcome: string;
    rule: Rule.JSON;
  }

  export interface EARL extends earl.EARL {
    "@type": "earl:Assertion";
    "earl:test": {
      "@id": string;
    };
  }

  export class Passed<I, T, Q = unknown> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{ [key: string]: Rule.Expectation }>
    ): Passed<I, T, Q> {
      return new Passed(rule, target, expectations);
    }

    public readonly target: T;
    public readonly expectations: Record<{ [key: string]: Rule.Expectation }>;

    private constructor(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{ [key: string]: Rule.Expectation }>
    ) {
      super(rule);

      this.target = target;
      this.expectations = expectations;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Passed &&
        Equatable.equals(value.rule, this.rule) &&
        Equatable.equals(value.target, this.target) &&
        Equatable.equals(value.expectations, this.expectations)
      );
    }

    public toJSON(): Passed.JSON {
      return {
        outcome: "passed",
        rule: this.rule.toJSON(),
        target: json.Serializable.toJSON(this.target),
        expectations: this.expectations.toJSON()
      };
    }

    public toEARL(): Passed.EARL {
      const outcome: Passed.EARL = {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:passed"
          }
        }
      };

      for (const pointer of earl.Serializable.toEARL(this.target)) {
        outcome["earl:result"]["earl:pointer"] = pointer;
      }

      return outcome;
    }
  }

  export namespace Passed {
    export interface JSON extends Outcome.JSON {
      [key: string]: json.JSON;
      outcome: "passed";
      target: json.JSON;
      expectations: Record.JSON;
    }

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:passed";
        };
        "earl:pointer"?: earl.EARL;
      };
    }
  }

  export class Failed<I, T, Q = unknown> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{ [key: string]: Rule.Expectation }>
    ): Failed<I, T, Q> {
      return new Failed(rule, target, expectations);
    }

    public readonly target: T;
    public readonly expectations: Record<{ [key: string]: Rule.Expectation }>;

    private constructor(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{ [key: string]: Rule.Expectation }>
    ) {
      super(rule);

      this.target = target;
      this.expectations = expectations;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Failed &&
        Equatable.equals(value.rule, this.rule) &&
        Equatable.equals(value.target, this.target) &&
        Equatable.equals(value.expectations, this.expectations)
      );
    }

    public toJSON(): Failed.JSON {
      return {
        outcome: "failed",
        rule: this.rule.toJSON(),
        target: json.Serializable.toJSON(this.target),
        expectations: this.expectations.toJSON()
      };
    }

    public toEARL(): Failed.EARL {
      const outcome: Failed.EARL = {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:failed"
          }
        }
      };

      for (const pointer of earl.Serializable.toEARL(this.target)) {
        outcome["earl:result"]["earl:pointer"] = pointer;
      }

      return outcome;
    }
  }

  export namespace Failed {
    export interface JSON extends Outcome.JSON {
      [key: string]: json.JSON;
      outcome: "failed";
      target: json.JSON;
      expectations: Record.JSON;
    }

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:failed";
        };
        "earl:pointer"?: earl.EARL;
      };
    }
  }

  export class CantTell<I, T, Q = unknown> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(
      rule: Rule<I, T, Q>,
      target: T
    ): CantTell<I, T, Q> {
      return new CantTell(rule, target);
    }

    public readonly target: T;

    private constructor(rule: Rule<I, T, Q>, target: T) {
      super(rule);

      this.target = target;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof CantTell &&
        Equatable.equals(value.rule, this.rule) &&
        Equatable.equals(value.target, this.target)
      );
    }

    public toJSON(): CantTell.JSON {
      return {
        outcome: "cantTell",
        rule: this.rule.toJSON(),
        target: json.Serializable.toJSON(this.target)
      };
    }

    public toEARL(): CantTell.EARL {
      return {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:cantTell"
          }
        }
      };
    }
  }

  export namespace CantTell {
    export interface JSON extends Outcome.JSON {
      [key: string]: json.JSON;
      outcome: "cantTell";
      target: json.JSON;
    }

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:cantTell";
        };
      };
    }
  }

  export type Applicable<I, T, Q = unknown> =
    | Passed<I, T, Q>
    | Failed<I, T, Q>
    | CantTell<I, T, Q>;

  export class Inapplicable<I, T, Q = unknown> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(rule: Rule<I, T, Q>): Inapplicable<I, T, Q> {
      return new Inapplicable(rule);
    }

    private constructor(rule: Rule<I, T, Q>) {
      super(rule);
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Inapplicable && Equatable.equals(value.rule, this.rule)
      );
    }

    public toJSON(): Inapplicable.JSON {
      return {
        outcome: "inapplicable",
        rule: this.rule.toJSON()
      };
    }

    public toEARL(): Inapplicable.EARL {
      return {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:inapplicable"
          }
        }
      };
    }
  }

  export namespace Inapplicable {
    export interface JSON extends Outcome.JSON {
      [key: string]: json.JSON;
      outcome: "inapplicable";
    }

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:inapplicable";
        };
      };
    }
  }

  function expectationToTrilean(expectation: Rule.Expectation): Trilean {
    return expectation.isOk() || (expectation.isErr() ? false : undefined);
  }

  export function from<I, T, Q>(
    rule: Rule<I, T, Q>,
    target: T,
    expectations: Record<{ [key: string]: Rule.Expectation }>
  ): Outcome.Applicable<I, T, Q> {
    return Predicate.fold(
      every(expectationToTrilean),
      expectations.values(),
      () => Passed.of(rule, target, expectations),
      () => Failed.of(rule, target, expectations),
      () => CantTell.of(rule, target)
    );
  }

  export function isPassed<I, T, Q>(
    outcome: Outcome<I, T, Q>
  ): outcome is Passed<I, T, Q> {
    return outcome instanceof Passed;
  }

  export function isFailed<I, T, Q>(
    outcome: Outcome<I, T, Q>
  ): outcome is Failed<I, T, Q> {
    return outcome instanceof Failed;
  }

  export function isCantTell<I, T, Q>(
    outcome: Outcome<I, T, Q>
  ): outcome is CantTell<I, T, Q> {
    return outcome instanceof CantTell;
  }

  export function isApplicable<I, T, Q>(
    outcome: Outcome<I, T, Q>
  ): outcome is Applicable<I, T, Q> {
    return isPassed(outcome) || isFailed(outcome) || isCantTell(outcome);
  }

  export function isInapplicable<I, T, Q>(
    outcome: Outcome<I, T, Q>
  ): outcome is Inapplicable<I, T, Q> {
    return outcome instanceof Inapplicable;
  }
}
