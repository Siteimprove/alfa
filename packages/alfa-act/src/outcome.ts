import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Err, Result } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

import { Diagnostic } from "./diagnostic";
import { Rule } from "./rule";

/**
 * @public
 * I: type of Input for the associated rule
 * T: type of the rule's test target
 * Q: questions' metadata type
 * S: possible types of questions' subject.
 */
export abstract class Outcome<I, T, Q = never, S = T>
  implements
    Equatable,
    json.Serializable<Outcome.JSON>,
    earl.Serializable<Outcome.EARL>,
    sarif.Serializable<sarif.Result>
{
  protected readonly _rule: Rule<I, T, Q, S>;

  protected constructor(rule: Rule<I, T, Q, S>) {
    this._rule = rule;
  }

  public get rule(): Rule<I, T, Q, S> {
    return this._rule;
  }

  public get target(): T | undefined {
    return undefined;
  }

  public abstract equals<I, T, Q, S>(value: Outcome<I, T, Q, S>): boolean;

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

  public abstract toSARIF(): sarif.Result;
}

/**
 * @public
 */
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

  export class Passed<I, T, Q = never, S = T> extends Outcome<I, T, Q, S> {
    public static of<I, T, Q, S>(
      rule: Rule<I, T, Q, S>,
      target: T,
      expectations: Record<{
        [key: string]: Result<Diagnostic>;
      }>
    ): Passed<I, T, Q, S> {
      return new Passed(rule, target, expectations);
    }

    private readonly _target: T;
    private readonly _expectations: Record<{
      [key: string]: Result<Diagnostic>;
    }>;

    private constructor(
      rule: Rule<I, T, Q, S>,
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

    public equals<I, T, Q, S>(value: Passed<I, T, Q, S>): boolean;

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
    export interface JSON<T> extends Outcome.JSON {
      [key: string]: json.JSON;
      outcome: "passed";
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

    export function isPassed<I, T, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is Passed<I, T, Q, S>;

    export function isPassed<I, T, Q, S>(
      value: unknown
    ): value is Passed<I, T, Q, S>;

    export function isPassed<I, T, Q, S>(
      value: unknown
    ): value is Passed<I, T, Q, S> {
      return value instanceof Passed;
    }
  }

  export const { of: passed, isPassed } = Passed;

  export class Failed<I, T, Q = never, S = T> extends Outcome<I, T, Q, S> {
    public static of<I, T, Q, S>(
      rule: Rule<I, T, Q, S>,
      target: T,
      expectations: Record<{
        [key: string]: Result<Diagnostic>;
      }>
    ): Failed<I, T, Q, S> {
      return new Failed(rule, target, expectations);
    }

    private readonly _target: T;
    private readonly _expectations: Record<{
      [key: string]: Result<Diagnostic>;
    }>;

    private constructor(
      rule: Rule<I, T, Q, S>,
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

    public equals<I, T, Q, S>(value: Failed<I, T, Q, S>): boolean;

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
    export interface JSON<T> extends Outcome.JSON {
      [key: string]: json.JSON;
      outcome: "failed";
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

    export function isFailed<I, T, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is Failed<I, T, Q, S>;

    export function isFailed<I, T, Q, S>(
      value: unknown
    ): value is Failed<I, T, Q, S>;

    export function isFailed<I, T, Q, S>(
      value: unknown
    ): value is Failed<I, T, Q, S> {
      return value instanceof Failed;
    }
  }

  export const { of: failed, isFailed } = Failed;

  export class CantTell<I, T, Q = never, S = T> extends Outcome<I, T, Q, S> {
    public static of<I, T, Q, S>(
      rule: Rule<I, T, Q, S>,
      target: T,
      diagnostic: Diagnostic
    ): CantTell<I, T, Q, S> {
      return new CantTell(rule, target, diagnostic);
    }

    private readonly _target: T;
    private readonly _diagnostic: Diagnostic;

    private constructor(
      rule: Rule<I, T, Q, S>,
      target: T,
      diagnostic: Diagnostic
    ) {
      super(rule);

      this._target = target;
      this._diagnostic = diagnostic;
    }

    public get target(): T {
      return this._target;
    }

    public get diagnostic(): Diagnostic {
      return this._diagnostic;
    }

    public equals<I, T, Q, S>(value: CantTell<I, T, Q, S>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof CantTell &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target) &&
        value._diagnostic.equals(this._diagnostic)
      );
    }

    public toJSON(): CantTell.JSON<T> {
      return {
        outcome: "cantTell",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
        diagnostic: this._diagnostic.toJSON(),
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
    export interface JSON<T> extends Outcome.JSON {
      [key: string]: json.JSON;
      outcome: "cantTell";
      target: json.Serializable.ToJSON<T>;
      diagnostic: json.Serializable.ToJSON<Diagnostic>;
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

    export function isCantTell<I, T, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is CantTell<I, T, Q, S>;

    export function isCantTell<I, T, Q, S>(
      value: unknown
    ): value is CantTell<I, T, Q, S>;

    export function isCantTell<I, T, Q, S>(
      value: unknown
    ): value is CantTell<I, T, Q, S> {
      return value instanceof CantTell;
    }
  }

  export const { of: cantTell, isCantTell } = CantTell;

  export type Applicable<I, T, Q = unknown, S = T> =
    | Passed<I, T, Q, S>
    | Failed<I, T, Q, S>
    | CantTell<I, T, Q, S>;

  export namespace Applicable {
    export function isApplicable<I, T, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is Applicable<I, T, Q, S>;

    export function isApplicable<I, T, Q, S>(
      value: unknown
    ): value is Applicable<I, T, Q, S>;

    export function isApplicable<I, T, Q, S>(
      value: unknown
    ): value is Applicable<I, T, Q, S> {
      return isPassed(value) || isFailed(value) || isCantTell(value);
    }
  }

  export const { isApplicable } = Applicable;

  export class Inapplicable<I, T, Q = unknown, S = T> extends Outcome<
    I,
    T,
    Q,
    S
  > {
    public static of<I, T, Q, S>(
      rule: Rule<I, T, Q, S>
    ): Inapplicable<I, T, Q, S> {
      return new Inapplicable(rule);
    }

    private constructor(rule: Rule<I, T, Q, S>) {
      super(rule);
    }

    public equals<I, T, Q, S>(value: Inapplicable<I, T, Q, S>): boolean;

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

    export function isInapplicable<I, T, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is Inapplicable<I, T, Q, S>;

    export function isInapplicable<I, T, Q, S>(
      value: unknown
    ): value is Inapplicable<I, T, Q, S>;

    export function isInapplicable<I, T, Q, S>(
      value: unknown
    ): value is Inapplicable<I, T, Q, S> {
      return value instanceof Inapplicable;
    }
  }

  export const { of: inapplicable, isInapplicable } = Inapplicable;

  export function from<I, T, Q, S>(
    rule: Rule<I, T, Q, S>,
    target: T,
    expectations: Record<{
      [key: string]: Option<Result<Diagnostic>>;
    }>
  ): Outcome.Applicable<I, T, Q, S> {
    return Trilean.fold(
      (expectations) =>
        Trilean.every(expectations, (expectation) =>
          expectation
            .map<Trilean>((expectation) => expectation.isOk())
            .getOr(undefined)
        ),
      () =>
        Passed.of(
          rule,
          target,
          Record.from(
            Iterable.map(expectations.entries(), ([id, expectation]) => [
              id,
              // Due to the predicate in every, this branch is only taken if every
              // expectation is a Some<Ok<T>>.
              expectation.getUnsafe(),
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
              // One expectation being a Some<Err<T>> is enough to take that branch,
              // even if others are None.
              expectation.getOr(Err.of(Diagnostic.empty)),
            ])
          )
        ),
      () => CantTell.of(rule, target, Diagnostic.empty),
      expectations.values()
    );
  }
}
