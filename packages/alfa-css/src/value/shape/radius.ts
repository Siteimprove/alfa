import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Keyword } from "../keyword";
import { Length } from "../length";
import { Percentage } from "../percentage";

import { Value } from "../../value";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";
import { Token } from "../../syntax/token";

const { either, mapResult } = Parser;

/**
 * @see https://drafts.csswg.org/css-shapes/#typedef-shape-radius
 */
export class Radius<
  R extends Length | Percentage | Radius.Side =
    | Length
    | Percentage
    | Radius.Side
> extends Value<"shape"> {
  public static of<R extends Length | Percentage | Radius.Side>(
    value: R
  ): Radius<R> {
    return new Radius(value);
  }

  private readonly _value: R;

  private constructor(value: R) {
    super();
    this._value = value;
  }

  public get value(): R {
    return this._value;
  }

  public get type(): "shape" {
    return "shape";
  }

  public get kind(): "radius" {
    return "radius";
  }

  public equals(value: Radius): boolean;
  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Radius && value.value.equals(this.value);
  }

  public hash(hash: Hash) {
    this.value.hash(hash);
  }

  public toJSON(): Radius.JSON {
    return {
      type: "shape",
      kind: "radius",
      value: this.value.toJSON(),
    };
  }

  public toString(): string {
    return this.value.toString();
  }
}

export namespace Radius {
  export interface JSON extends Value.JSON<"shape"> {
    kind: "radius";
    value: Length.JSON | Percentage.JSON | Keyword.JSON;
  }

  export type Side = Side.Closest | Side.Farthest;

  export namespace Side {
    /**
     * @see https://drafts.csswg.org/css-shapes/#closest-side
     */
    export type Closest = Keyword<"closest-side">;

    /**
     * @see https://drafts.csswg.org/css-shapes/#farthest-side
     */
    export type Farthest = Keyword<"farthest-side">;
  }

  export function isRadius(value: unknown): value is Radius {
    return value instanceof Radius;
  }

  export const parse = mapResult<
    Slice<Token>,
    Length | Percentage | Side,
    Radius,
    string
  >(
    either(
      either(Length.parse, Percentage.parse),
      Keyword.parse("closest-side", "farthest-side")
    ),
    (radius) =>
      radius.type !== "keyword" && radius.value < 0
        ? Err.of("Radius cannot be negative")
        : Ok.of(Radius.of(radius))
  );
}
