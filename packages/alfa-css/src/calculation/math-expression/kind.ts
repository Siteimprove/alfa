import { Equatable } from "@siteimprove/alfa-equatable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Err, Result } from "@siteimprove/alfa-result";

import { Numeric } from "../numeric";

/**
 * {@link https://drafts.css-houdini.org/css-typed-om/#numeric-typing}
 *
 * @remarks
 * The shared `Value` interface already uses the term "type" to denote the
 * different types of CSS values. We therefore use the term "kind" to denote
 * the type of a calculation.
 *
 * @internal
 */
export class Kind implements Equatable, Serializable {
  public static of(kind?: Kind.Base): Kind {
    const kinds = this._empty._kinds;

    return new Kind(kind === undefined ? kinds : kinds.set(kind, 1), None);
  }

  private static _empty = new Kind(
    Record.of({
      length: 0,
      angle: 0,
      percentage: 0,
    }),
    None
  );

  public static empty(): Kind {
    return this._empty;
  }

  private readonly _kinds: Kind.Map;

  private readonly _hint: Option<Kind.Hint>;

  private constructor(kinds: Kind.Map, hint: Option<Kind.Hint>) {
    this._kinds = kinds;
    this._hint = hint;
  }

  public get kinds(): Kind.Map {
    return this._kinds;
  }

  public get hint(): Option<Kind.Hint> {
    return this._hint;
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public is(
    kind?: Kind.Base,
    value: number = 1,
    hinted: boolean = kind === "percentage"
  ): boolean {
    for (const entry of this._kinds) {
      // this is not the dimension we're looking for, and it has power 0.
      if (entry[0] !== kind && entry[1] === 0) {
        continue;
      }

      // this is the dimension we're looking for, and it has the correct power.
      if (entry[0] === kind && entry[1] === value) {
        continue;
      }

      return false;
    }

    // All the entries have the correct value. Is a hint allowed?
    return this._hint.isNone() || hinted;
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-add-two-types}
   */
  public add(kind: Kind): Result<Kind, string> {
    let a: Kind = this;
    let b: Kind = kind;

    if (a._hint.some((a) => b._hint.some((b) => a !== b))) {
      return Err.of(`Cannot add types ${a} and ${b}`);
    }

    if (a._hint.isNone()) {
      for (const hint of b._hint) {
        a = a.apply(hint);
      }
    }

    if (b._hint.isNone()) {
      for (const hint of a._hint) {
        b = b.apply(hint);
      }
    }

    if (a._kinds.equals(b._kinds)) {
      return Result.of(a);
    }

    if (
      [a._kinds, b._kinds].some(
        (kinds) => kinds.get("percentage").getOr(0) !== 0
      ) &&
      [a._kinds, b._kinds].some((kinds) =>
        kinds.some((value, kind) => kind !== "percentage" && value !== 0)
      )
    ) {
      for (const hint of ["length", "angle"] as const) {
        const kind = a.apply(hint);

        if (kind._kinds.equals(b.apply(hint)._kinds)) {
          return Result.of(kind);
        }
      }
    }

    return Err.of(`Cannot add types ${a} and ${b}`);
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-multiply-two-types}
   */
  public multiply(kind: Kind): Result<Kind, string> {
    let a: Kind = this;
    let b: Kind = kind;

    if (a._hint.some((a) => b._hint.some((b) => a !== b))) {
      return Err.of(`Cannot multiply types ${a} and ${b}`);
    }

    if (a._hint.isNone()) {
      for (const hint of b._hint) {
        a = a.apply(hint);
      }
    }

    if (b._hint.isNone()) {
      for (const hint of a._hint) {
        b = b.apply(hint);
      }
    }

    return Result.of(
      new Kind(
        b._kinds.reduce(
          (kinds, value, kind) =>
            kinds.set(kind, kinds.get(kind).getOr(0) + value),
          a._kinds
        ),
        a._hint
      )
    );
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-invert-a-type}
   */
  public invert(): Kind {
    return new Kind(
      this._kinds.reduce(
        (kinds, value, kind) => kinds.set(kind, -1 * value),
        this._kinds
      ),
      None
    );
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#apply-the-percent-hint}
   */
  public apply(hint: Kind.Hint): Kind {
    return new Kind(
      this._kinds
        .set(
          hint,
          this._kinds.get(hint).getOr(0) +
            this._kinds.get("percentage").getOr(0)
        )
        .set("percentage", 0),
      Option.of(hint)
    );
  }

  public equals(value: this): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Kind &&
      value._kinds.equals(this._kinds) &&
      value._hint.equals(this._hint)
    );
  }

  public toJSON(): Kind.JSON {
    return {
      kinds: this._kinds.toArray(),
      hint: this._hint.getOr(null),
    };
  }
}

/**
 * @internal
 */
export namespace Kind {
  export interface JSON {
    [key: string]: json.JSON;
    kinds: Array<[Base, number]>;
    hint: Hint | null;
  }

  export function isKind(value: unknown): value is Kind {
    return value instanceof Kind;
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-type}
   */
  export type Map = Record<{
    [K in Base]: number;
  }>;

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-base-type}
   */
  export type Base = Numeric.Dimension | "percentage";

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-percent-hint}
   */
  export type Hint = Exclude<Kind.Base, "percentage">;
}
