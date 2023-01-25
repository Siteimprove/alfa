import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
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
export abstract class Outcome<
  I,
  T extends Hashable,
  Q = never,
  S = T,
  V extends Outcome.Value = Outcome.Value
> implements
    Equatable,
    Hashable,
    json.Serializable<Outcome.JSON<V>>,
    earl.Serializable<Outcome.EARL>,
    sarif.Serializable<sarif.Result>
{
  /**
   * {@link https://www.w3.org/TR/EARL10-Schema/#outcome}
   */
  private readonly _outcome: V;
  /**
   * {@link https://www.w3.org/TR/EARL10-Schema/#test}
   * While this is called a "test" in EARL, in Alfa this is always a "rule".
   */
  protected readonly _rule: Rule<I, T, Q, S>;
  /**
   * {@link https://www.w3.org/TR/EARL10-Schema/#mode}
   */
  protected readonly _mode: Outcome.Mode;

  protected constructor(
    outcome: V,
    rule: Rule<I, T, Q, S>,
    mode: Outcome.Mode
  ) {
    this._outcome = outcome;
    this._rule = rule;
    this._mode = mode;
  }

  /**
   * {@link https://www.w3.org/TR/EARL10-Schema/#outcome}
   */
  public get outcome(): V {
    return this._outcome;
  }

  /**
   * {@link https://www.w3.org/TR/EARL10-Schema/#test}
   * While this is called a "test" in EARL, in Alfa this is always a "rule".
   */
  public get rule(): Rule<I, T, Q, S> {
    return this._rule;
  }

  /**
   * {@link https://www.w3.org/TR/EARL10-Schema/#mode}
   */
  public get mode(): Outcome.Mode {
    return this._mode;
  }

  public get isSemiAuto(): boolean {
    return this._mode === Outcome.Mode.SemiAuto;
  }

  public get target(): T | undefined {
    return undefined;
  }

  public equals<
    I,
    T extends Hashable,
    Q,
    S,
    V extends Outcome.Value = Outcome.Value
  >(value: Outcome<I, T, Q, S, V>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Outcome &&
      value._rule.equals(this._rule) &&
      value._outcome === this._outcome &&
      value._mode === this._mode
    );
  }

  public hash(hash: Hash): void {
    this._rule.hash(hash);
    hash.writeString(this._outcome);
    hash.writeString(this._mode);
  }

  public toJSON(): Outcome.JSON<V> {
    return {
      outcome: this._outcome,
      rule: this._rule.toJSON(),
      mode: this._mode,
    };
  }

  public toEARL(): Outcome.EARL {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
      },
      "@type": "earl:Assertion",
      mode: `earl:${this._mode}`,
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
  /**
   * {@link https://www.w3.org/TR/EARL10-Schema/#OutcomeValue}
   *
   * @internal
   */
  export enum Value {
    Inapplicable = "inapplicable",
    Passed = "passed",
    Failed = "failed",
    CantTell = "cantTell",
  }

  /**
   * {@link https://www.w3.org/TR/EARL10-Schema/#TestMode}
   */
  export enum Mode {
    Automatic = "automatic",
    SemiAuto = "semiAuto",
  }

  export interface JSON<V extends Value = Value> {
    [key: string]: json.JSON;
    outcome: V;
    rule: Rule.JSON;
    mode: Mode;
  }

  export interface EARL extends earl.EARL {
    "@type": "earl:Assertion";
    "earl:test": {
      "@id": string;
    };
  }

  export class Passed<I, T extends Hashable, Q = never, S = T> extends Outcome<
    I,
    T,
    Q,
    S,
    Value.Passed
  > {
    public static of<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>,
      target: T,
      expectations: Record<{
        [key: string]: Result<Diagnostic>;
      }>,
      mode: Mode
    ): Passed<I, T, Q, S> {
      return new Passed(rule, target, expectations, mode);
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
      }>,
      mode: Mode
    ) {
      super(Value.Passed, rule, mode);

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

    public equals<I, T extends Hashable, Q, S>(
      value: Passed<I, T, Q, S>
    ): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        super.equals(value) &&
        value instanceof Passed &&
        Equatable.equals(value._target, this._target) &&
        value._expectations.equals(this._expectations)
      );
    }

    public hash(hash: Hash) {
      super.hash(hash);
      this._target.hash(hash);
      for (const [id, result] of this._expectations) {
        hash.writeString(id);
        result.hash(hash);
      }
    }

    public toJSON(): Passed.JSON<T> {
      return {
        ...super.toJSON(),
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
    export interface JSON<T> extends Outcome.JSON<Value.Passed> {
      [key: string]: json.JSON;
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

    export function isPassed<I, T extends Hashable, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is Passed<I, T, Q, S>;

    export function isPassed<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Passed<I, T, Q, S>;

    export function isPassed<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Passed<I, T, Q, S> {
      return value instanceof Passed;
    }
  }

  export const { of: passed, isPassed } = Passed;

  export class Failed<I, T extends Hashable, Q = never, S = T> extends Outcome<
    I,
    T,
    Q,
    S,
    Value.Failed
  > {
    public static of<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>,
      target: T,
      expectations: Record<{
        [key: string]: Result<Diagnostic>;
      }>,
      mode: Mode
    ): Failed<I, T, Q, S> {
      return new Failed(rule, target, expectations, mode);
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
      }>,
      mode: Mode
    ) {
      super(Value.Failed, rule, mode);

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

    public equals<I, T extends Hashable, Q, S>(
      value: Failed<I, T, Q, S>
    ): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        super.equals(value) &&
        value instanceof Failed &&
        Equatable.equals(value._target, this._target) &&
        value._expectations.equals(this._expectations)
      );
    }

    public hash(hash: Hash) {
      super.hash(hash);
      this._target.hash(hash);
      for (const [id, result] of this._expectations) {
        hash.writeString(id);
        result.hash(hash);
      }
    }

    public toJSON(): Failed.JSON<T> {
      return {
        ...super.toJSON(),
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
    export interface JSON<T> extends Outcome.JSON<Value.Failed> {
      [key: string]: json.JSON;
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

    export function isFailed<I, T extends Hashable, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is Failed<I, T, Q, S>;

    export function isFailed<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Failed<I, T, Q, S>;

    export function isFailed<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Failed<I, T, Q, S> {
      return value instanceof Failed;
    }
  }

  export const { of: failed, isFailed } = Failed;

  export class CantTell<
    I,
    T extends Hashable,
    Q = never,
    S = T
  > extends Outcome<I, T, Q, S, Value.CantTell> {
    public static of<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>,
      target: T,
      diagnostic: Diagnostic,
      mode: Mode
    ): CantTell<I, T, Q, S> {
      return new CantTell(rule, target, diagnostic, mode);
    }

    private readonly _target: T;
    private readonly _diagnostic: Diagnostic;

    private constructor(
      rule: Rule<I, T, Q, S>,
      target: T,
      diagnostic: Diagnostic,
      mode: Mode
    ) {
      super(Value.CantTell, rule, mode);

      this._target = target;
      this._diagnostic = diagnostic;
    }

    public get target(): T {
      return this._target;
    }

    public get diagnostic(): Diagnostic {
      return this._diagnostic;
    }

    public equals<I, T extends Hashable, Q, S>(
      value: CantTell<I, T, Q, S>
    ): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        super.equals(value) &&
        value instanceof CantTell &&
        Equatable.equals(value._target, this._target) &&
        value._diagnostic.equals(this._diagnostic)
      );
    }

    public hash(hash: Hash) {
      super.hash(hash);
      this._target.hash(hash);
      this._diagnostic.hash(hash);
    }

    public toJSON(): CantTell.JSON<T> {
      return {
        ...super.toJSON(),
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
    export interface JSON<T> extends Outcome.JSON<Value.CantTell> {
      [key: string]: json.JSON;
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

    export function isCantTell<I, T extends Hashable, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is CantTell<I, T, Q, S>;

    export function isCantTell<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is CantTell<I, T, Q, S>;

    export function isCantTell<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is CantTell<I, T, Q, S> {
      return value instanceof CantTell;
    }
  }

  export const { of: cantTell, isCantTell } = CantTell;

  export type Applicable<I, T extends Hashable, Q = unknown, S = T> =
    | Passed<I, T, Q, S>
    | Failed<I, T, Q, S>
    | CantTell<I, T, Q, S>;

  export namespace Applicable {
    export function isApplicable<I, T extends Hashable, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is Applicable<I, T, Q, S>;

    export function isApplicable<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Applicable<I, T, Q, S>;

    export function isApplicable<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Applicable<I, T, Q, S> {
      return isPassed(value) || isFailed(value) || isCantTell(value);
    }
  }

  export const { isApplicable } = Applicable;

  export class Inapplicable<
    I,
    T extends Hashable,
    Q = unknown,
    S = T
  > extends Outcome<I, T, Q, S, Value.Inapplicable> {
    public static of<I, T extends Hashable, Q, S>(
      rule: Rule<I, T, Q, S>,
      mode: Mode
    ): Inapplicable<I, T, Q, S> {
      return new Inapplicable(rule, mode);
    }

    private constructor(rule: Rule<I, T, Q, S>, mode: Mode) {
      super(Value.Inapplicable, rule, mode);
    }

    public equals<I, T extends Hashable, Q, S>(
      value: Inapplicable<I, T, Q, S>
    ): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return super.equals(value) && value instanceof Inapplicable;
    }

    public toJSON(): Inapplicable.JSON {
      return super.toJSON();
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
    export interface JSON extends Outcome.JSON<Value.Inapplicable> {}

    export interface EARL extends Outcome.EARL {
      "earl:result": {
        "@type": "earl:TestResult";
        "earl:outcome": {
          "@id": "earl:inapplicable";
        };
      };
    }

    export function isInapplicable<I, T extends Hashable, Q, S>(
      value: Outcome<I, T, Q, S>
    ): value is Inapplicable<I, T, Q, S>;

    export function isInapplicable<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Inapplicable<I, T, Q, S>;

    export function isInapplicable<I, T extends Hashable, Q, S>(
      value: unknown
    ): value is Inapplicable<I, T, Q, S> {
      return value instanceof Inapplicable;
    }
  }

  export const { of: inapplicable, isInapplicable } = Inapplicable;

  export function from<I, T extends Hashable, Q, S>(
    rule: Rule<I, T, Q, S>,
    target: T,
    expectations: Record<{
      [key: string]: Option<Result<Diagnostic>>;
    }>,
    mode: Mode
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
          ),
          mode
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
          ),
          mode
        ),
      () => CantTell.of(rule, target, Diagnostic.empty, mode),
      expectations.values()
    );
  }
}
