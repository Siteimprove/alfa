import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Result } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

import * as base from "@siteimprove/alfa-act-base";

import { Diagnostic } from "./diagnostic";
import { Rule } from "./rule";

/**
 * @public
 */
export abstract class Outcome<I, T, Q = never>
  extends base.Outcome<I, T, Q>
  implements
    Equatable,
    json.Serializable<Outcome.JSON>,
    earl.Serializable<Outcome.EARL>,
    sarif.Serializable<sarif.Result> {
  protected constructor(rule: Rule<I, T, Q>) {
    super(rule);
  }

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

  public abstract toSARIF(): sarif.Result;
}

/**
 * @public
 */
export namespace Outcome {
  export interface JSON<O extends string = string>
    extends base.Outcome.JSON<O> {}

  export interface EARL extends earl.EARL {
    "@type": "earl:Assertion";
    "earl:test": {
      "@id": string;
    };
  }

  export class Passed<I, T, Q = never> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{
        [key: string]: Result<Diagnostic>;
      }>
    ): Passed<I, T, Q> {
      return new Passed(rule, target, expectations);
    }

    private readonly _target: T;
    private readonly _expectations: Record<{
      [key: string]: Result<Diagnostic>;
    }>;

    private constructor(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{
        [key: string]: Result<Diagnostic>;
      }>
    ) {
      super(rule);

      this._target = target;
      this._expectations = Record.from(expectations.toArray());
    }

    public get target(): T {
      return this._target;
    }

    public get expectations(): Record<{
      [key: string]: Result<Diagnostic>;
    }> {
      return this._expectations;
    }

    public equals<I, T, Q>(value: Passed<I, T, Q>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Passed &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target) &&
        value._expectations.equals(this._expectations)
      );
    }

    public toJSON(): Passed.JSON<T> {
      return {
        outcome: "passed",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
        expectations: this._expectations
          .toArray()
          .map(([id, expectation]) => [id, expectation.toJSON()]),
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
            .reduce(
              (message, [, expectation]) =>
                message + "\n" + expectation.get().message,
              ""
            )
            .trim(),
        },
      };

      for (const pointer of earl.Serializable.toEARL(this._target)) {
        outcome["earl:result"]["earl:pointer"] = pointer;
      }

      return outcome;
    }

    public toSARIF(): sarif.Result {
      const message =
        "The test target passes all requirements:\n\n" +
        this._expectations
          .toArray()
          .map(([, expectation]) => `- ${expectation.get().message}`)
          .join("\n");

      const locations: Array<sarif.Location> = [];

      for (const location of sarif.Serializable.toSARIF(this._target)) {
        locations.push(location as sarif.Location);
      }

      return {
        ruleId: this._rule.uri,
        kind: "pass",
        level: "none",
        message: {
          text: message,
          markdown: message,
        },
        locations,
      };
    }
  }

  export namespace Passed {
    export interface JSON<T> extends Outcome.JSON<"passed"> {
      target: json.Serializable.ToJSON<T>;
      expectations: Array<[string, Result.JSON<Diagnostic.JSON>]>;
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

    export function isPassed<I, T, Q>(
      value: Outcome<I, T, Q>
    ): value is Passed<I, T, Q>;

    export function isPassed<I, T, Q>(value: unknown): value is Passed<I, T, Q>;

    export function isPassed<I, T, Q>(
      value: unknown
    ): value is Passed<I, T, Q> {
      return value instanceof Passed;
    }
  }

  export const { of: passed, isPassed } = Passed;

  export class Failed<I, T, Q = never> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{
        [key: string]: Result<Diagnostic>;
      }>
    ): Failed<I, T, Q> {
      return new Failed(rule, target, expectations);
    }

    private readonly _target: T;
    private readonly _expectations: Record<{
      [key: string]: Result<Diagnostic>;
    }>;

    private constructor(
      rule: Rule<I, T, Q>,
      target: T,
      expectations: Record<{
        [key: string]: Result<Diagnostic>;
      }>
    ) {
      super(rule);

      this._target = target;
      this._expectations = Record.from(expectations.toArray());
    }

    public get target(): T {
      return this._target;
    }

    public get expectations(): Record<{
      [key: string]: Result<Diagnostic>;
    }> {
      return this._expectations;
    }

    public equals<I, T, Q>(value: Failed<I, T, Q>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Failed &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target) &&
        value._expectations.equals(this._expectations)
      );
    }

    public toJSON(): Failed.JSON<T> {
      return {
        outcome: "failed",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
        expectations: this._expectations
          .toArray()
          .map(([id, expectation]) => [id, expectation.toJSON()]),
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
              if (expectation.isErr()) {
                message += "\n" + expectation.getErr().message;
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

    public toSARIF(): sarif.Result {
      const message =
        "The test target fails the following requirements:\n\n" +
        this._expectations
          .toArray()
          .filter(([, expectation]) => expectation.isErr())
          .map(([, expectation]) => `- ${expectation.getErr().message}`)
          .join("\n");

      const locations: Array<sarif.Location> = [];

      for (const location of sarif.Serializable.toSARIF(this._target)) {
        locations.push(location as sarif.Location);
      }

      return {
        ruleId: this._rule.uri,
        kind: "fail",
        level: "error",
        message: {
          text: message,
          markdown: message,
        },
        locations,
      };
    }
  }

  export namespace Failed {
    export interface JSON<T> extends Outcome.JSON<"failed"> {
      target: json.Serializable.ToJSON<T>;
      expectations: Array<[string, Result.JSON<Diagnostic.JSON>]>;
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

    export function isFailed<I, T, Q>(
      value: Outcome<I, T, Q>
    ): value is Failed<I, T, Q>;

    export function isFailed<I, T, Q>(value: unknown): value is Failed<I, T, Q>;

    export function isFailed<I, T, Q>(
      value: unknown
    ): value is Failed<I, T, Q> {
      return value instanceof Failed;
    }
  }

  export const { of: failed, isFailed } = Failed;

  export class CantTell<I, T, Q = never> extends Outcome<I, T, Q> {
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

    public equals<I, T, Q>(value: CantTell<I, T, Q>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof CantTell &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target)
      );
    }

    public toJSON(): CantTell.JSON<T> {
      return {
        outcome: "cantTell",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
      };
    }

    public toEARL(): CantTell.EARL {
      const outcome: CantTell.EARL = {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:cantTell",
          },
        },
      };

      for (const pointer of earl.Serializable.toEARL(this._target)) {
        outcome["earl:result"]["earl:pointer"] = pointer;
      }

      return outcome;
    }

    public toSARIF(): sarif.Result {
      const message =
        "The rule has outstanding questions that must be answered for the test target";

      const locations: Array<sarif.Location> = [];

      for (const location of sarif.Serializable.toSARIF(this._target)) {
        locations.push(location as sarif.Location);
      }

      return {
        ruleId: this._rule.uri,
        kind: "review",
        level: "warning",
        message: {
          text: message,
          markdown: message,
        },
        locations,
      };
    }
  }

  export namespace CantTell {
    export interface JSON<T> extends Outcome.JSON<"cantTell"> {
      target: json.Serializable.ToJSON<T>;
    }

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:cantTell";
        };
        "earl:pointer"?: earl.EARL;
      };
    }

    export function isCantTell<I, T, Q>(
      value: Outcome<I, T, Q>
    ): value is CantTell<I, T, Q>;

    export function isCantTell<I, T, Q>(
      value: unknown
    ): value is CantTell<I, T, Q>;

    export function isCantTell<I, T, Q>(
      value: unknown
    ): value is CantTell<I, T, Q> {
      return value instanceof CantTell;
    }
  }

  export const { of: cantTell, isCantTell } = CantTell;

  export type Applicable<I, T, Q = unknown> =
    | Passed<I, T, Q>
    | Failed<I, T, Q>
    | CantTell<I, T, Q>;

  export namespace Applicable {
    export function isApplicable<I, T, Q>(
      value: Outcome<I, T, Q>
    ): value is Applicable<I, T, Q>;

    export function isApplicable<I, T, Q>(
      value: unknown
    ): value is Applicable<I, T, Q>;

    export function isApplicable<I, T, Q>(
      value: unknown
    ): value is Applicable<I, T, Q> {
      return isPassed(value) || isFailed(value) || isCantTell(value);
    }
  }

  export const { isApplicable } = Applicable;

  export class Inapplicable<I, T, Q = unknown> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(rule: Rule<I, T, Q>): Inapplicable<I, T, Q> {
      return new Inapplicable(rule);
    }

    private constructor(rule: Rule<I, T, Q>) {
      super(rule);
    }

    public equals<I, T, Q>(value: Inapplicable<I, T, Q>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
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

    public toSARIF(): sarif.Result {
      const message = "The rule did not apply to the test subject";

      return {
        ruleId: this._rule.uri,
        kind: "notApplicable",
        level: "none",
        message: {
          text: message,
          markdown: message,
        },
      };
    }
  }

  export namespace Inapplicable {
    export interface JSON extends Outcome.JSON<"inapplicable"> {}

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:inapplicable";
        };
      };
    }

    export function isInapplicable<I, T, Q>(
      value: Outcome<I, T, Q>
    ): value is Inapplicable<I, T, Q>;

    export function isInapplicable<I, T, Q>(
      value: unknown
    ): value is Inapplicable<I, T, Q>;

    export function isInapplicable<I, T, Q>(
      value: unknown
    ): value is Inapplicable<I, T, Q> {
      return value instanceof Inapplicable;
    }
  }

  export const { of: inapplicable, isInapplicable } = Inapplicable;

  export class Inventory<I, T, Q = never> extends Outcome<I, T, Q> {
    public static of<I, T, Q>(
      rule: Rule<I, T, Q>,
      target: T,
      inventory: base.Diagnostic
    ): Inventory<I, T, Q> {
      return new Inventory(rule, target, inventory);
    }

    private readonly _target: T;
    private readonly _inventory: base.Diagnostic;

    private constructor(
      rule: Rule<I, T, Q>,
      target: T,
      inventory: base.Diagnostic
    ) {
      super(rule);

      this._target = target;
      this._inventory = inventory;
    }

    public get target(): T {
      return this._target;
    }

    public get inventory(): base.Diagnostic {
      return this._inventory;
    }

    public equals<I, T, Q>(value: Inventory<I, T, Q>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Inventory &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target) &&
        value._inventory.equals(this._inventory)
      );
    }

    public toJSON(): Inventory.JSON<T> {
      return {
        outcome: "inventory",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
        inventory: this._inventory.toJSON(),
      };
    }

    public toEARL(): Inventory.EARL {
      const outcome: Inventory.EARL = {
        ...super.toEARL(),
        "earl:result": {
          "@type": "earl:TestResult",
          "earl:outcome": {
            "@id": "earl:inventory",
          },
        },
      };

      for (const pointer of earl.Serializable.toEARL(this._target)) {
        outcome["earl:result"]["earl:pointer"] = pointer;
      }

      return outcome;
    }

    public toSARIF(): sarif.Result {
      const locations: Array<sarif.Location> = [];

      for (const location of sarif.Serializable.toSARIF(this._target)) {
        locations.push(location as sarif.Location);
      }

      return {
        ruleId: this._rule.uri,
        kind: "informational",
        level: "none",
        message: {
          text: "inventory",
          markdown: "inventory",
        },
        locations,
      };
    }
  }

  export namespace Inventory {
    export interface JSON<T> extends Outcome.JSON<"inventory"> {
      target: json.Serializable.ToJSON<T>;
      inventory: base.Diagnostic.JSON;
    }

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:inventory";
        };
        "earl:pointer"?: earl.EARL;
      };
    }

    export function isInventory<I, T, Q>(
      value: Outcome<I, T, Q>
    ): value is Inventory<I, T, Q>;

    export function isInventory<I, T, Q>(
      value: unknown
    ): value is Inventory<I, T, Q>;

    export function isInventory<I, T, Q>(
      value: unknown
    ): value is Inventory<I, T, Q> {
      return value instanceof Inventory;
    }
  }

  export const { of: inventory, isInventory } = Inventory;

  export function from<I, T, Q>(
    rule: Rule<I, T, Q>,
    target: T,
    expectations: Record<{
      [key: string]: Option<Result<Diagnostic>>;
    }>
  ): Outcome.Applicable<I, T, Q> {
    return Trilean.fold(
      (expectations) =>
        Trilean.every(expectations, (expectation) =>
          expectation.map((expectation) => expectation.isOk()).getOr(undefined)
        ),
      () =>
        Passed.of(
          rule,
          target,
          Record.from(
            Iterable.map(expectations.entries(), ([id, expectation]) => [
              id,
              expectation.get(),
            ])
          )
        ),
      () =>
        Failed.of(
          rule,
          target,
          Record.from(
            Iterable.map(expectations.entries(), ([id, expectation]) => [
              id,
              expectation.get(),
            ])
          )
        ),
      () => CantTell.of(rule, target),
      expectations.values()
    );
  }
}
