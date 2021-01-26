import { Value } from "../value";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

export class FourSides<
  T extends Equatable & Hashable & Serializable
> extends Value<"four-sides"> {
  public static of<T extends Equatable & Hashable & Serializable>(
    all: T
  ): FourSides<T>;
  public static of<T extends Equatable & Hashable & Serializable>(
    vertical: T,
    horizontal: T
  ): FourSides<T>;
  public static of<T extends Equatable & Hashable & Serializable>(
    top: T,
    horizontal: T,
    bottom: T
  ): FourSides<T>;
  public static of<T extends Equatable & Hashable & Serializable>(
    top: T,
    right: T,
    bottom: T,
    left: T
  ): FourSides<T>;

  public static of<T extends Equatable & Hashable & Serializable>(
    one: T,
    two?: T,
    three?: T,
    four?: T
  ): FourSides<T> {
    const top = one;
    const right = two ?? one;
    const bottom = three ?? one;
    const left = four ?? two ?? one;

    return new FourSides(top, right, bottom, left);
  }

  private readonly _top: T;
  private readonly _right: T;
  private readonly _bottom: T;
  private readonly _left: T;

  public constructor(top: T, right: T, bottom: T, left: T) {
    super();
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    this._left = left;
  }

  public get top(): T {
    return this._top;
  }

  public get right(): T {
    return this._right;
  }

  public get bottom(): T {
    return this._bottom;
  }

  public get left(): T {
    return this._left;
  }

  public get type(): "four-sides" {
    return "four-sides";
  }

  public equals(value: FourSides<T>): boolean;
  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof FourSides &&
      value._top === this._top &&
      value._right === this._right &&
      value._bottom === this._bottom &&
      value._left === this._left
    );
  }

  public hash(hash: Hash) {
    this._top.hash(hash);
    this._right.hash(hash);
    this._bottom.hash(hash);
    this._left.hash(hash);
  }

  public toJSON(): FourSides.JSON<T> {
    return {
      type: "four-sides",
      top: Serializable.toJSON<T>(this.top),
      right: Serializable.toJSON<T>(this.right),
      bottom: Serializable.toJSON<T>(this.bottom),
      left: Serializable.toJSON<T>(this.left),
    };
  }

  public toString(): string {
    return `${this.top} ${this.right} ${this.bottom} ${this.left}`;
  }
}

export namespace FourSides {
  export interface JSON<T extends Serializable>
    extends Value.JSON<"four-sides"> {
    top: Serializable.ToJSON<T>;
    right: Serializable.ToJSON<T>;
    bottom: Serializable.ToJSON<T>;
    left: Serializable.ToJSON<T>;
  }
}
