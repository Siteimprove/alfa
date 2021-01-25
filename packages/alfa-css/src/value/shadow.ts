import { Hash } from "@siteimprove/alfa-hash";

import { Value } from "../value";

import { Color } from "./color";
import { Length } from "./length";

export class Shadow<
  V extends Length = Length,
  H extends Length = V,
  B extends Length = Length,
  S extends Length = Length,
  C extends Color = Color
> extends Value<"shadow"> {
  public static of<
    V extends Length = Length,
    H extends Length = V,
    B extends Length = Length,
    S extends Length = Length,
    C extends Color = Color
  >(
    vertical: V,
    horizontal: H,
    blur: B,
    spread: S,
    color: C,
    isInset: boolean
  ): Shadow<V, H, B, S, C> {
    return new Shadow(vertical, horizontal, blur, spread, color, isInset);
  }

  private readonly _vertical: V;
  private readonly _horizontal: H;
  private readonly _blur: B;
  private readonly _spread: S;
  private readonly _color: C;
  private readonly _isInset: boolean;

  private constructor(
    vertical: V,
    horizontal: H,
    blur: B,
    spread: S,
    color: C,
    isInset: boolean
  ) {
    super();
    this._vertical = vertical;
    this._horizontal = horizontal;
    this._blur = blur;
    this._spread = spread;
    this._color = color;
    this._isInset = isInset;
  }

  public get type(): "shadow" {
    return "shadow";
  }

  public get vertical(): V {
    return this._vertical;
  }

  public get horizontal(): H {
    return this._horizontal;
  }

  public get blur(): B {
    return this._blur;
  }

  public get spread(): S {
    return this._spread;
  }

  public get color(): C {
    return this._color;
  }

  public get isInset(): boolean {
    return this._isInset;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Shadow &&
      value._vertical.equals(this._vertical) &&
      value._horizontal.equals(this._horizontal) &&
      value._blur.equals(this._blur) &&
      value._spread.equals(this._spread) &&
      value._color.equals(this._color) &&
      value._isInset === this._isInset
    );
  }

  public hash(hash: Hash): void {
    this._vertical.hash(hash);
    this._horizontal.hash(hash);
    this._blur.hash(hash);
    this._spread.hash(hash);
    this._color.hash(hash);
    Hash.writeBoolean(hash, this._isInset);
  }

  public toJSON(): Shadow.JSON {
    return {
      type: "shadow",
      vertical: this._vertical.toJSON(),
      horizontal: this._horizontal.toJSON(),
      blur: this._blur.toJSON(),
      spread: this._spread.toJSON(),
      color: this._color.toJSON(),
      isInset: this._isInset,
    };
  }

  public toString(): string {
    return `${this._color} ${this._vertical} ${this._horizontal} ${
      this._blur
    } ${this._spread}${this._isInset ? " inset" : ""}`;
  }
}

export namespace Shadow {
  export interface JSON extends Value.JSON<"shadow"> {
    vertical: Length.JSON;
    horizontal: Length.JSON;
    blur: Length.JSON;
    spread: Length.JSON;
    color: Color.JSON;
    isInset: boolean;
  }
}
