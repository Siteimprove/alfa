import { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import type { Parser as CSSParser } from "../../syntax";

import { Keyword } from "../keyword";
import { LengthPercentage } from "../numeric";
import { Value } from "../value";

import { BasicShape } from "./basic-shape";

const { either, filter, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-shapes/#typedef-shape-radius}
 *
 * @public
 */
export class Radius<
  R extends LengthPercentage | Radius.Side = LengthPercentage | Radius.Side
> extends BasicShape<"radius", Value.HasCalculation<[R]>> {
  public static of<R extends LengthPercentage | Radius.Side>(
    value: R
  ): Radius<R> {
    return new Radius(value);
  }

  private readonly _value: R;

  private constructor(value: R) {
    super("radius", Value.hasCalculation(value));
    this._value = value;
  }

  public get value(): R {
    return this._value;
  }

  public resolve(resolver: Radius.Resolver): Radius.Canonical {
    if (Keyword.isKeyword(this._value)) {
      // TS lose the fact that if this._value is a Side, then this must be a
      // Radius<Side>…
      return this as Radius<Radius.Side>;
    }

    const resolved = LengthPercentage.resolve(resolver)(this._value);

    return new Radius(
      LengthPercentage.of(
        Real.clamp(resolved.value, 0, Infinity),
        resolved.unit
      )
    );
  }

  public equals(value: Radius): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Radius && value._value.equals(this._value);
  }

  public hash(hash: Hash) {
    hash.writeHashable(this._value);
  }

  public toJSON(): Radius.JSON {
    return {
      ...super.toJSON(),
      value: this._value.toJSON(),
    };
  }

  public toString(): string {
    return this.value.toString();
  }
}

/**
 * @public
 */
export namespace Radius {
  export type Canonical = Radius<LengthPercentage.Canonical | Side>;

  export interface JSON extends BasicShape.JSON<"radius"> {
    value: LengthPercentage.JSON | Keyword.JSON;
  }

  export type Resolver = LengthPercentage.Resolver;

  export type PartiallyResolved = Radius<
    LengthPercentage.PartiallyResolved | Side
  >;

  export type PartialResolver = LengthPercentage.PartialResolver;

  export function PartiallyResolve(
    resolver: PartialResolver
  ): (value: Radius) => PartiallyResolved {
    return (value) => {
      if (Keyword.isKeyword(value.value)) {
        // TS lose the fact that if this._value is a Side, then this must be a
        // Radius<Side>…
        return value as Radius<Radius.Side>;
      }

      const resolved = LengthPercentage.partiallyResolve(resolver)(value.value);

      if (resolved.hasCalculation()) {
        return Radius.of(resolved);
      }

      const clamped = Real.clamp(resolved.value, 0, Infinity);

      return Radius.of(
        LengthPercentage.isPercentage(resolved)
          ? LengthPercentage.of(clamped)
          : LengthPercentage.of(clamped, resolved.unit)
      );
    };
  }

  export type Side = Side.Closest | Side.Farthest;

  export namespace Side {
    /**
     * {@link https://drafts.csswg.org/css-shapes/#closest-side}
     */
    export type Closest = Keyword<"closest-side">;

    /**
     * {@link https://drafts.csswg.org/css-shapes/#farthest-side}
     */
    export type Farthest = Keyword<"farthest-side">;
  }

  export function isRadius(value: unknown): value is Radius {
    return value instanceof Radius;
  }

  export const parse: CSSParser<Radius> = map(
    either(
      filter(
        LengthPercentage.parse,
        // https://drafts.csswg.org/css-values/#calc-range
        (value) => value.hasCalculation() || value.value >= 0,
        () => "Radius cannot be negative"
      ),
      Keyword.parse("closest-side", "farthest-side")
    ),
    (radius) => Radius.of(radius)
  );
}
