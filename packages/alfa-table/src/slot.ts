import type { Comparable } from "@siteimprove/alfa-comparable";
import { Comparison } from "@siteimprove/alfa-comparable";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";

/**
 * {@link https://html.spec.whatwg.org/#concept-slots}
 *
 * @public
 */
export class Slot
  implements Comparable<Slot>, Equatable, Serializable<Slot.JSON>
{
  public static of(x: number, y: number): Slot {
    return new Slot(x, y);
  }

  private readonly _x: number;
  private readonly _y: number;

  protected constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public compare(slot: Slot): Comparison {
    // Slots are compared first by y-coordinate, then by x-coordinate. This way,
    // cells will be ordered as they appear in tree-order.

    if (this._y > slot._y) {
      return Comparison.Greater;
    }

    if (this._y < slot._y) {
      return Comparison.Less;
    }

    if (this._x > slot._x) {
      return Comparison.Greater;
    }

    if (this._x < slot._x) {
      return Comparison.Less;
    }

    return Comparison.Equal;
  }

  public equals(slot: Slot): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Slot && value._x === this._x && value._y === this._y
    );
  }

  public toJSON(): Slot.JSON {
    return {
      x: this._x,
      y: this._y,
    };
  }
}

/**
 * @public
 */
export namespace Slot {
  export interface JSON {
    [key: string]: json.JSON;
    x: number;
    y: number;
  }

  export function isSlot(value: unknown): value is Slot {
    return value instanceof Slot;
  }
}
