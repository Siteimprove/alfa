import { Length, Percentage, Value } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Hash } from "@siteimprove/alfa-hash";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { List } from "@siteimprove/alfa-list";

const { takeBetween, either, map } = Parser;

export class BorderRadius<
  T extends Length | Percentage = Length | Percentage
> extends Value<"radius"> {
  public static of<T extends Length | Percentage = Length | Percentage>(
    horizontal: T,
    vertical: T
  ): BorderRadius<T> {
    return new BorderRadius<T>(horizontal, vertical);
  }
  private readonly _horizontal: T;
  private readonly _vertical: T;

  private constructor(horizontal: T, vertical: T) {
    super();
    this._horizontal = horizontal;
    this._vertical = vertical;
  }

  public get type(): "radius" {
    return "radius";
  }

  public get horizontal(): T {
    return this._horizontal;
  }

  public get vertical(): T {
    return this._vertical;
  }

  public equals(value: BorderRadius): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof BorderRadius &&
      value._horizontal.equals(this._horizontal) &&
      value._vertical.equals(this._vertical)
    );
  }

  public hash(hash: Hash) {
    this._horizontal.hash(hash);
    this._vertical.hash(hash);
  }

  public toJSON(): BorderRadius.JSON {
    return {
      type: "radius",
      horizontal: this._horizontal.toJSON(),
      vertical: this._vertical.toJSON(),
    };
  }

  public toString(): string {
    return `radius(${this._horizontal.toString()}, ${this._vertical.toString()})`;
  }
}

/**
 * @public
 */
export namespace BorderRadius {
  export interface JSON extends Value.JSON<"radius"> {
    horizontal: Length.JSON | Percentage.JSON;
    vertical: Length.JSON | Percentage.JSON;
  }

  export const parse = map(
    takeBetween(either(Length.parse, Percentage.parse), 1, 2),
    ([horizontal, vertical = horizontal]) =>
      BorderRadius.of(horizontal, vertical)
  );
}

/**
 * @internal
 */

export type Specified = BorderRadius<Length | Percentage>;

/**
 * @internal
 */
export type Computed = BorderRadius<Length<"px"> | Percentage>;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius
 * @internal
 */
export default Property.of<Specified, Computed>(
  BorderRadius.of(Length.of(0, "px"), Length.of(0, "px")),
  // TODO
  BorderRadius.parse,
  (value, style) => {
    // return List.of(
    //   [...value].map((borderRadius) => {
    //     BorderRadius.of(
    //       Length.isLength(borderRadius.horizontal)
    //         ? Resolver.length(borderRadius.horizontal, style)
    //         : borderRadius.horizontal,
    //       Length.isLength(borderRadius.vertical)
    //         ? Resolver.length(borderRadius.vertical, style)
    //         : borderRadius.vertical
    //     );
    //   })
    // );
    // return value.map((value) => {
    //   if (Length.isLength(value)) {
    //     return Resolver.length(value, style);
    //   }
    //   return value;
    // });
  }
);
