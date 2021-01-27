import { Length } from "../length";
import { Percentage } from "../percentage";
import { Value } from "../../value";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Array } from "@siteimprove/alfa-array";

/**
 * @see https://drafts.csswg.org/css-shapes/#funcdef-inset
 */
export class Inset<
  O extends Inset.Offset = Inset.Offset,
  C extends Inset.Corner = Inset.Corner
> extends Value<"shape"> {
  public static of<
    O extends Inset.Offset = Inset.Offset,
    C extends Inset.Corner = Inset.Corner
  >(
    offsets: readonly [O, O, O, O],
    corners: readonly [C, C, C, C]
  ): Inset<O, C>;
  public static of<
    O extends Inset.Offset = Inset.Offset,
    C extends Inset.Corner = Inset.Corner
  >(
    top: O,
    right: O,
    bottom: O,
    left: O,
    topLeft: C,
    topRight: C,
    bottomRight: C,
    bottomLeft: C
  ): Inset<O, C>;

  public static of<
    O extends Inset.Offset = Inset.Offset,
    C extends Inset.Corner = Inset.Corner
  >(
    ...args:
      | [readonly [O, O, O, O], readonly [C, C, C, C]]
      | [O, O, O, O, C, C, C, C]
  ): Inset<O, C> {
    const top = args.length === 2 ? args[0][0] : args[0];
    const right = args.length === 2 ? args[0][1] : args[1];
    const bottom = args.length === 2 ? args[0][2] : args[2];
    const left = args.length === 2 ? args[0][3] : args[3];
    const topLeft = args.length === 2 ? args[1][0] : args[4];
    const topRight = args.length === 2 ? args[1][1] : args[5];
    const bottomRight = args.length === 2 ? args[1][2] : args[6];
    const bottomLeft = args.length === 2 ? args[1][3] : args[7];

    return new Inset(
      top,
      right,
      bottom,
      left,
      topLeft,
      topRight,
      bottomRight,
      bottomLeft
    );
  }

  private readonly _top: O;
  private readonly _right: O;
  private readonly _bottom: O;
  private readonly _left: O;
  private readonly _topLeft: C;
  private readonly _topRight: C;
  private readonly _bottomRight: C;
  private readonly _bottomLeft: C;

  private constructor(
    top: O,
    right: O,
    bottom: O,
    left: O,
    topLeft: C,
    topRight: C,
    bottomRight: C,
    bottomLeft: C
  ) {
    super();
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    this._left = left;
    this._topLeft = topLeft;
    this._topRight = topRight;
    this._bottomLeft = bottomLeft;
    this._bottomRight = bottomRight;
  }

  public get top(): O {
    return this._top;
  }

  public get right(): O {
    return this._right;
  }

  public get bottom(): O {
    return this._bottom;
  }

  public get left(): O {
    return this._left;
  }

  public get offsets(): readonly [O, O, O, O] {
    return [this._top, this._right, this._bottom, this._left];
  }

  public get topLeft(): C {
    return this._topLeft;
  }

  public get topRight(): C {
    return this._topRight;
  }

  public get bottomRight(): C {
    return this._bottomRight;
  }

  public get bottomLeft(): C {
    return this._bottomLeft;
  }

  public get corners(): readonly [C, C, C, C] {
    return [this._topLeft, this._topRight, this._bottomRight, this._bottomLeft];
  }

  public get type(): "shape" {
    return "shape";
  }

  public get kind(): "inset" {
    return "inset";
  }

  public equals(value: this): boolean;
  public equals(value: unknown): value is this;
  public equals(value: unknown): boolean {
    return (
      value instanceof Inset &&
      value._top.equals(this._top) &&
      value._right.equals(this._right) &&
      value._bottom.equals(this._bottom) &&
      value._left.equals(this._left) &&
      Corner.equals(value._topLeft, this._topLeft) &&
      Corner.equals(value._topRight, this._topRight) &&
      Corner.equals(value._bottomRight, this._bottomRight) &&
      Corner.equals(value._bottomLeft, this._bottomLeft)
    );
  }

  public hash(hash: Hash): void {
    this._top.hash(hash);
    this._right.hash(hash);
    this._bottom.hash(hash);
    this._left.hash(hash);
    Corner.hash(this._topLeft, hash);
    Corner.hash(this._topRight, hash);
    Corner.hash(this._bottomRight, hash);
    Corner.hash(this._bottomLeft, hash);
  }

  public toJSON(): Inset.JSON {
    return {
      type: "shape",
      kind: "inset",
      offsets: {
        top: this.top.toJSON(),
        right: this.top.toJSON(),
        bottom: this.top.toJSON(),
        left: this.top.toJSON(),
      },
      corners: {
        topLeft: Corner.toJson(this.topLeft),
        topRight: Corner.toJson(this.topLeft),
        bottomRight: Corner.toJson(this.topLeft),
        bottomLeft: Corner.toJson(this.topLeft),
      },
    };
  }

  public toString(): string {
    let result = `ellipse(${this.top} ${this.right} ${this.bottom} ${this.left} round `;
    // printing out the radii in the correct format is not completely trivial…
    if (this.corners.some((c) => Array.isArray(c))) {
      // at least one corner has both horizontal and vertical radius, so we need to split things.
      const [tlh, tlv] = Array.isArray(this.topLeft)
        ? this.topLeft
        : [this.topLeft, this.topLeft];
      const [trh, trv] = Array.isArray(this.topRight)
        ? this.topRight
        : [this.topRight, this.topRight];
      const [brh, brv] = Array.isArray(this.bottomRight)
        ? this.bottomRight
        : [this.bottomRight, this.bottomRight];
      const [blh, blv] = Array.isArray(this.bottomLeft)
        ? this.bottomLeft
        : [this.bottomLeft, this.bottomLeft];

      result += `${tlh} ${trh} ${brh} ${blh} / ${tlv} ${trv} ${brv} ${blv})`;
    } else {
      result += `${this.topLeft} ${this.topRight} ${this.bottomRight} ${this.bottomLeft})`;
    }

    return result;
  }
}

export namespace Inset {
  export type Offset = Length | Percentage;
  type Radius = Length | Percentage;
  export type Corner = Radius | readonly [Radius, Radius];

  export interface JSON extends Value.JSON<"shape"> {
    kind: "inset";
    offsets: {
      top: Serializable.ToJSON<Offset>;
      right: Serializable.ToJSON<Offset>;
      bottom: Serializable.ToJSON<Offset>;
      left: Serializable.ToJSON<Offset>;
    };
    corners: {
      topLeft: Serializable.ToJSON<Corner>;
      topRight: Serializable.ToJSON<Corner>;
      bottomRight: Serializable.ToJSON<Corner>;
      bottomLeft: Serializable.ToJSON<Corner>;
    };
  }
}

namespace Corner {
  export function equals(c1: Inset.Corner, c2: Inset.Corner): boolean {
    if (Equatable.isEquatable(c1)) {
      return c1.equals(c2);
    }

    if (Equatable.isEquatable(c2)) {
      return c2.equals(c1);
    }

    return Array.equals(c1, c2);
  }

  export function hash(c: Inset.Corner, hash: Hash): void {
    if (Hashable.isHashable(c)) {
      c.hash(hash);
    } else {
      Array.hash(c, hash);
    }
  }

  export function toJson(c: Inset.Corner): Serializable.ToJSON<Inset.Corner> {
    if (Serializable.isSerializable(c)) {
      return c.toJSON();
    }

    return Array.toJSON(c);
  }
}
