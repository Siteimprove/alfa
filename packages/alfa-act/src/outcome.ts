import { Equality } from "@siteimprove/alfa-equality";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Document } from "@siteimprove/alfa-json-ld";
import { Record } from "@siteimprove/alfa-record";

import { Rule } from "./rule";

export abstract class Outcome<I, T, Q> implements Equality {
  public readonly rule: Rule<I, T, Q>;
  public readonly target?: T;

  protected constructor(rule: Rule<I, T, Q>) {
    this.rule = rule;
  }

  public abstract equals(value: unknown): value is Outcome<I, T, Q>;

  public abstract toJSON(): { outcome: Outcome.Type };

  public toEARL(): Document {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#"
      },
      "@type": "earl:Assertion",
      "earl:test": { "@id": this.rule.uri }
    };
  }
}

export namespace Outcome {
  export const enum Type {
    Passed = "passed",
    Failed = "failed",
    CantTell = "cantTell",
    Inapplicable = "inapplicable"
  }

  export namespace Type {
    export type Applicable = Exclude<Type, Type.Inapplicable>;
  }

  export class Passed<I, T, Q> extends Outcome<I, T, Q> {
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

    public equals(value: unknown): value is Passed<I, T, Q> {
      return (
        value instanceof Passed &&
        Equality.equals(value.rule, this.rule) &&
        Equality.equals(value.target, this.target) &&
        Equality.equals(value.expectations, this.expectations)
      );
    }

    public toJSON() {
      return {
        outcome: Type.Passed,
        rule: this.rule.toJSON(),
        target: this.target,
        expectations: this.expectations.toJSON()
      };
    }

    public toEARL(): Document {
      return {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": { "@id": `earl:${Type.Passed}` }
        }
      };
    }
  }

  export class Failed<I, T, Q> extends Outcome<I, T, Q> {
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

    public equals(value: unknown): value is Failed<I, T, Q> {
      return (
        value instanceof Failed &&
        Equality.equals(value.rule, this.rule) &&
        Equality.equals(value.target, this.target) &&
        Equality.equals(value.expectations, this.expectations)
      );
    }

    public toJSON() {
      return {
        outcome: Type.Failed,
        rule: this.rule.toJSON(),
        target: this.target,
        expectations: this.expectations.toJSON()
      };
    }

    public toEARL(): Document {
      return {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": { "@id": `earl:${Type.Failed}` }
        }
      };
    }
  }

  export class CantTell<I, T, Q> extends Outcome<I, T, Q> {
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

    public equals(value: unknown): value is CantTell<I, T, Q> {
      return (
        value instanceof CantTell &&
        Equality.equals(value.rule, this.rule) &&
        Equality.equals(value.target, this.target)
      );
    }

    public toJSON() {
      return {
        outcome: Type.CantTell,
        rule: this.rule.toJSON(),
        target: this.target
      };
    }

    public toEARL(): Document {
      return {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": { "@id": `earl:${Type.CantTell}` }
        }
      };
    }
  }

  export type Applicable<I, T, Q> =
    | Passed<I, T, Q>
    | Failed<I, T, Q>
    | CantTell<I, T, Q>;

  export class Inapplicable<I, T, Q> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(rule: Rule<I, T, Q>): Inapplicable<I, T, Q> {
      return new Inapplicable(rule);
    }

    private constructor(rule: Rule<I, T, Q>) {
      super(rule);
    }

    public equals(value: unknown): value is Inapplicable<I, T, Q> {
      return (
        value instanceof Inapplicable && Equality.equals(value.rule, this.rule)
      );
    }

    public toJSON() {
      return {
        outcome: Type.Inapplicable,
        rule: this.rule.toJSON()
      };
    }

    public toEARL(): Document {
      return {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": { "@id": `earl:${Type.Inapplicable}` }
        }
      };
    }
  }

  export function from<I, T, Q>(
    rule: Rule<I, T, Q>,
    target: T,
    expectations: Record<{ [key: string]: Rule.Expectation }>
  ): Outcome.Applicable<I, T, Q> {
    const holds = Iterable.every(expectations, ([id, expectation]) =>
      expectation.isOk()
    );

    return holds
      ? Passed.of(rule, target, expectations)
      : Failed.of(rule, target, expectations);
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
