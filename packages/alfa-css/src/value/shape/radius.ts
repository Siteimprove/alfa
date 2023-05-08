import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";
import { Value } from "../value";

import { Keyword } from "../keyword";
import { Length, Percentage } from "../../calculation";

const { either, map, filter } = Parser;

/**
 * {@link https://drafts.csswg.org/css-shapes/#typedef-shape-radius}
 *
 * @public
 */
export class Radius<
  R extends Length | Percentage | Radius.Side =
    | Length
    | Percentage
    | Radius.Side
> extends Value<"basic-shape"> {
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

  public get type(): "basic-shape" {
    return "basic-shape";
  }

  public get kind(): "radius" {
    return "radius";
  }

  public get value(): R {
    return this._value;
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
      type: "basic-shape",
      kind: "radius",
      value: this.value.toJSON(),
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
  export interface JSON extends Value.JSON<"basic-shape"> {
    kind: "radius";
    value: Length.JSON | Percentage.JSON | Keyword.JSON;
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

  export const parse: Parser<Slice<Token>, Radius, string> = map(
    either(
      filter(
        either(Length.parse, Percentage.parse),
        ({ value }) => value >= 0,
        () => "Radius cannot be negative"
      ),
      Keyword.parse("closest-side", "farthest-side")
    ),
    (radius) => Radius.of(radius)
  );
}
