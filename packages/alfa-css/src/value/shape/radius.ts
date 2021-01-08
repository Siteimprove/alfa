import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import { Keyword } from "../keyword";
import { Length } from "../length";
import { Percentage } from "../percentage";

import * as json from "@siteimprove/alfa-json";

const { either, map } = Parser;

/**
 * @see https://drafts.csswg.org/css-shapes/#typedef-shape-radius
 */
export class Radius<
  R extends Length | Percentage | Radius.Side =
    | Length
    | Percentage
    | Radius.Side
> implements Equatable, Hashable, Serializable {
  public static of<R extends Length | Percentage | Radius.Side>(
    value: R
  ): Radius<R> {
    return new Radius(value);
  }

  private readonly _value: R;

  private constructor(value: R) {
    this._value = value;
  }

  public get value(): R {
    return this._value;
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
      value: this.value.toJSON(),
    };
  }

  public toString(): string {
    return this.value.toString();
  }
}

export namespace Radius {
  export interface JSON {
    [key: string]: json.JSON;
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

  export const parse = map(
    either(
      either(Length.parse, Percentage.parse),
      Keyword.parse("closest-side", "farthest-side")
    ),
    (radius) => Radius.of(radius)
  );
}
