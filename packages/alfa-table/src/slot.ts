import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * @see https://html.spec.whatwg.org/#concept-slots
 */
export class Slot implements Comparable<Slot>, Equatable, Serializable {
  public static of(x: number, y: number): Slot {
    return new Slot(x, y);
  }

  private readonly _x: number;
  private readonly _y: number;

  private constructor(x: number, y: number) {
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
    switch (true) {
      case this._y > slot._y:
        return Comparison.Greater;

      case this._y < slot.y:
        return Comparison.Less;

      case this._x > slot._x:
        return Comparison.Greater;

      case this._x < slot._x:
        return Comparison.Less;

      default:
        return Comparison.Equal;
    }
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
