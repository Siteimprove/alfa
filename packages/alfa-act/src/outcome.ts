import { Equatable } from "@siteimprove/alfa-equatable";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Predicate } from "@siteimprove/alfa-trilean";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as trilean from "@siteimprove/alfa-trilean";

import { Rule } from "./rule";

export abstract class Outcome<I, T, Q = unknown>
  implements Equatable, json.Serializable, earl.Serializable {
  protected readonly _rule: Rule<I, T, Q>;

  protected constructor(rule: Rule<I, T, Q>) {
    this._rule = rule;
  }

  public get rule(): Rule<I, T, Q> {
    return this._rule;
  }

  public get target(): T | undefined {
    return undefined;
  }

  public abstract equals(value: unknown): value is this;

  public abstract toJSON(): Outcome.JSON;

  public toEARL(): Outcome.EARL {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
      },
      "@type": "earl:Assertion",
      "earl:test": {
        "@id": this._rule.uri,
      },
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

    private readonly _target: T;
    private readonly _expectations: Record<{ [key: string]: Rule.Expectation }>;

    private constructor(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{ [key: string]: Rule.Expectation }>
    ) {
      super(rule);

      this._target = target;
      this._expectations = Record.from(
        expectations
          .toArray()
          .map(([id, expectation]) => [
            id,
            expectation.map((result) =>
              result.map(normalize).mapErr(normalize)
            ),
          ])
      );
    }

    public get target(): T {
      return this._target;
    }

    public get expectations(): Record<{ [key: string]: Rule.Expectation }> {
      return this._expectations;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Passed &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target) &&
        value._expectations.equals(this._expectations)
      );
    }

    public toJSON(): Passed.JSON {
      return {
        outcome: "passed",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
        expectations: this._expectations
          .toArray()
          .map(([id, expectation]) => [
            id,
            expectation.map((expectation) => expectation.toJSON()).getOr(null),
          ]),
      };
    }

    public toEARL(): Passed.EARL {
      const outcome: Passed.EARL = {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:passed",
          },
          "earl:info": this._expectations
            .toArray()
            .reduce((message, [, expectation]) => {
              if (expectation.isSome() && expectation.get().isOk()) {
                message += "\n" + expectation.get().get();
              }

              return message;
            }, "")
            .trim(),
        },
      };

      for (const pointer of earl.Serializable.toEARL(this._target)) {
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
      expectations: Array<[string, Result.JSON | null]>;
    }

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:passed";
        };
        "earl:info": string;
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

    private readonly _target: T;
    private readonly _expectations: Record<{ [key: string]: Rule.Expectation }>;

    private constructor(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{ [key: string]: Rule.Expectation }>
    ) {
      super(rule);

      this._target = target;
      this._expectations = Record.from(
        expectations
          .toArray()
          .map(([id, expectation]) => [
            id,
            expectation.map((result) =>
              result.map(normalize).mapErr(normalize)
            ),
          ])
      );
    }

    public get target(): T {
      return this._target;
    }

    public get expectations(): Record<{ [key: string]: Rule.Expectation }> {
      return this._expectations;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Failed &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target) &&
        value._expectations.equals(this._expectations)
      );
    }

    public toJSON(): Failed.JSON {
      return {
        outcome: "failed",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
        expectations: this._expectations
          .toArray()
          .map(([id, expectation]) => [
            id,
            expectation.map((expectation) => expectation.toJSON()).getOr(null),
          ]),
      };
    }

    public toEARL(): Failed.EARL {
      const outcome: Failed.EARL = {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:failed",
          },
          "earl:info": this._expectations
            .toArray()
            .reduce((message, [, expectation]) => {
              if (expectation.isSome() && expectation.get().isErr()) {
                message += "\n" + expectation.get().getErr();
              }

              return message;
            }, "")
            .trim(),
        },
      };

      for (const pointer of earl.Serializable.toEARL(this._target)) {
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
      expectations: Array<[string, Result.JSON | null]>;
    }

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:failed";
        };
        "earl:info": string;
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

    private readonly _target: T;

    private constructor(rule: Rule<I, T, Q>, target: T) {
      super(rule);

      this._target = target;
    }

    public get target(): T {
      return this._target;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof CantTell &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target)
      );
    }

    public toJSON(): CantTell.JSON {
      return {
        outcome: "cantTell",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
      };
    }

    public toEARL(): CantTell.EARL {
      return {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:cantTell",
          },
        },
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
      return value instanceof Inapplicable && value._rule.equals(this._rule);
    }

    public toJSON(): Inapplicable.JSON {
      return {
        outcome: "inapplicable",
        rule: this._rule.toJSON(),
      };
    }

    public toEARL(): Inapplicable.EARL {
      return {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:inapplicable",
          },
        },
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

  export function from<I, T, Q>(
    rule: Rule<I, T, Q>,
    target: T,
    expectations: Record<{ [key: string]: Rule.Expectation }>
  ): Outcome.Applicable<I, T, Q> {
    return Predicate.fold(
      trilean.every((expectation) =>
        expectation.isNone() ? undefined : expectation.get().isOk()
      ),
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

function normalize(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
