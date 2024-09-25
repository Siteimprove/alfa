import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Number } from "./numeric/index.js";
import { Value } from "./value.js";
import { List } from "./collection/index.js";
import type { Resolvable } from "./resolvable.js";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/scale}
 *
 * @public
 */
export class ScaleProperty
  extends Value<"scale", false>
  implements Resolvable<ScaleProperty.Canonical, never>
{
  public static of(x: Number, y: Number, z?: Number): ScaleProperty {
    return z === undefined
      ? new ScaleProperty(x.resolve(), y.resolve())
      : new ScaleProperty(x.resolve(), y.resolve(), z.resolve());
  }

  private readonly _x: Number.Canonical;
  private readonly _y: Number.Canonical;
  private readonly _z?: Number.Canonical;

  private constructor(
    x: Number.Canonical,
    y: Number.Canonical,
    z?: Number.Canonical,
  ) {
    super("scale", false);
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public get x(): Number {
    return this._x;
  }

  public get y(): Number {
    return this._y;
  }

  public get z(): Number | undefined {
    return this._z;
  }

  public resolve(): ScaleProperty {
    return this;
  }

  public equals(value: unknown): value is this {
    if (!(value instanceof ScaleProperty)) {
      return false;
    }

    if (!value._x.equals(this._x)) {
      return false;
    }

    if (!value._y.equals(this._y)) {
      return false;
    }

    if (value._z !== undefined && this._z !== undefined) {
      return value._z.equals(this._z);
    }

    return value._z === undefined && this._z === undefined;
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._x).writeHashable(this._y).writeUnknown(this._z);
  }

  public toJSON(): ScaleProperty.JSON {
    return {
      ...super.toJSON(),
      x: this._x.toJSON(),
      y: this._y.toJSON(),
      z: this._z !== undefined ? this._z.toJSON() : null,
    };
  }

  public toString(): string {
    if (this._z !== undefined) {
      return `${this._x} ${this._y} ${this._z}`;
    }

    return this._x.equals(this._y)
      ? this._x.toString()
      : `${this._x} ${this._y}`;
  }
}

/**
 * @public
 */
export namespace ScaleProperty {
  export type Canonical = ScaleProperty;

  export interface JSON extends Value.JSON<"scale"> {
    x: Number.Fixed.JSON;
    y: Number.Fixed.JSON;
    z: Number.Fixed.JSON | null;
  }

  export function isScaleProperty(value: unknown): value is ScaleProperty {
    return value instanceof ScaleProperty;
  }

  /**
   * {@link }
   */
  export const parse = map(
    List.parseSpaceSeparated(Number.parse, 1, 3),
    (list) => {
      const [x, y, z] = list.values;
      return ScaleProperty.of(x, y ?? x, z);
    },
  );
}
