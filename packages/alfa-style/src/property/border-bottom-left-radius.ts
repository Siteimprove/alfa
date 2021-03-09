import { Length, Percentage, Value } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Resolver } from "../resolver";

import { Property } from "../property";

const { takeBetween, either, map } = Parser;

export class Radius<
  T extends Length | Percentage = Length | Percentage
> extends Value<"radius"> {
  public static of<T extends Length | Percentage = Length | Percentage>(
    horizontal: T,
    vertical: T
  ): Radius<T> {
    return new Radius<T>(horizontal, vertical);
  }
  private readonly _horizontal: T;
  private readonly _vertical: T;

  private constructor(horizontal: T, vertical: T) {
    super();
    this._horizontal = horizontal;
    this._vertical = vertical;
  }
}

export namespace Radius {
  /**
   * @internal
   */
  export const parse = map(
    takeBetween(either(Length.parse, Percentage.parse), 1, 2),
    // TODO
    ([horizontal, vertical = horizontal]) => Radius.of(horizontal, vertical)
  );
}

/**
 * @internal
 */

export type Specified = Radius<Length | Percentage>;

/**
 * @internal
 */
export type Computed = Radius<Length<"px"> | Percentage>;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius
 * @internal
 */
export default Property.of<Specified, Computed>(
  Radius.of(Length.of(0, "px"), Length.of(0, "px")),
  // TODO
  Radius.parse,
  (leftRadius, style) => {
    leftRadius.value.map((value) => {
      switch (value.type) {
        case "length":
          return Resolver.length(value, style);
        default:
          return value;
      }
    });
  }
);
