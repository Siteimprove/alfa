import { Equality } from "@siteimprove/alfa-equality";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Record } from "@siteimprove/alfa-record";

import { Rule } from "./rule";

export abstract class Outcome<I, T, Q, B> implements Equality {
  public readonly rule: Rule<I, T, Q, B>;
  public readonly target?: T;

  protected constructor(rule: Rule<I, T, Q, B>) {
    this.rule = rule;
  }

  public abstract equals(value: unknown): value is Outcome<I, T, Q, B>;
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

  export class Passed<I, T, Q, B> extends Outcome<I, T, Q, B> {
    public static of<I, T, Q, B>(
      rule: Rule<I, T, Q, B>,
      target: T,
      expectations: Record<Rule.Expectations>
    ): Passed<I, T, Q, B> {
      return new Passed(rule, target, expectations);
    }

    public readonly target: T;
    public readonly expectations: Record<Rule.Expectations>;

    private constructor(
      rule: Rule<I, T, Q, B>,
      target: T,
      expectations: Record<Rule.Expectations>
    ) {
      super(rule);

      this.target = target;
      this.expectations = expectations;
    }

    public equals(value: unknown): value is Passed<I, T, Q, B> {
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
        rule: this.rule,
        target: this.target,
        expectations: this.expectations
      };
    }
  }

  export class Failed<I, T, Q, B> extends Outcome<I, T, Q, B> {
    public static of<I, T, Q, B>(
      rule: Rule<I, T, Q, B>,
      target: T,
      expectations: Record<Rule.Expectations>
    ): Failed<I, T, Q, B> {
      return new Failed(rule, target, expectations);
    }

    public readonly target: T;
    public readonly expectations: Record<Rule.Expectations>;

    private constructor(
      rule: Rule<I, T, Q, B>,
      target: T,
      expectations: Record<Rule.Expectations>
    ) {
      super(rule);

      this.target = target;
      this.expectations = expectations;
    }

    public equals(value: unknown): value is Failed<I, T, Q, B> {
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
        rule: this.rule,
        target: this.target,
        expectations: this.expectations
      };
    }
  }

  export class CantTell<I, T, Q, B> extends Outcome<I, T, Q, B> {
    public static of<I, T, Q, B>(
      rule: Rule<I, T, Q, B>,
      target: T
    ): CantTell<I, T, Q, B> {
      return new CantTell(rule, target);
    }

    public readonly target: T;

    private constructor(rule: Rule<I, T, Q, B>, target: T) {
      super(rule);

      this.target = target;
    }

    public equals(value: unknown): value is CantTell<I, T, Q, B> {
      return (
        value instanceof CantTell &&
        Equality.equals(value.rule, this.rule) &&
        Equality.equals(value.target, this.target)
      );
    }

    public toJSON() {
      return {
        outcome: Type.CantTell,
        rule: this.rule,
        target: this.target
      };
    }
  }

  export type Applicable<I, T, Q, B> =
    | Passed<I, T, Q, B>
    | Failed<I, T, Q, B>
    | CantTell<I, T, Q, B>;

  export class Inapplicable<I, T, Q, B> extends Outcome<I, T, Q, B> {
    public static of<I, T, Q, B>(
      rule: Rule<I, T, Q, B>
    ): Inapplicable<I, T, Q, B> {
      return new Inapplicable(rule);
    }

    private constructor(rule: Rule<I, T, Q, B>) {
      super(rule);
    }

    public equals(value: unknown): value is Inapplicable<I, T, Q, B> {
      return (
        value instanceof Inapplicable && Equality.equals(value.rule, this.rule)
      );
    }

    public toJSON() {
      return {
        outcome: Type.Inapplicable,
        rule: this.rule
      };
    }
  }

  export function from<I, T, Q, B>(
    rule: Rule<I, T, Q, B>,
    target: T,
    expectations: Record<Rule.Expectations>
  ): Outcome.Applicable<I, T, Q, B> {
    const holds = Iterable.every(
      expectations,
      ([id, expectation]) => expectation.holds
    );

    return holds
      ? Passed.of(rule, target, expectations)
      : Failed.of(rule, target, expectations);
  }

  export function isPassed<I, T, Q, B>(
    outcome: Outcome<I, T, Q, B>
  ): outcome is Passed<I, T, Q, B> {
    return outcome instanceof Passed;
  }

  export function isFailed<I, T, Q, B>(
    outcome: Outcome<I, T, Q, B>
  ): outcome is Failed<I, T, Q, B> {
    return outcome instanceof Failed;
  }

  export function isCantTell<I, T, Q, B>(
    outcome: Outcome<I, T, Q, B>
  ): outcome is CantTell<I, T, Q, B> {
    return outcome instanceof CantTell;
  }

  export function isApplicable<I, T, Q, B>(
    outcome: Outcome<I, T, Q, B>
  ): outcome is Applicable<I, T, Q, B> {
    return isPassed(outcome) || isFailed(outcome) || isCantTell(outcome);
  }

  export function isInapplicable<I, T, Q, B>(
    outcome: Outcome<I, T, Q, B>
  ): outcome is Inapplicable<I, T, Q, B> {
    return outcome instanceof Inapplicable;
  }
}
