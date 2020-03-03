import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

export class Slice<T> implements Iterable<T>, Equatable, Serializable {
  public static of<T>(
    array: Readonly<Array<T>>,
    start: number = 0,
    end: number = array.length
  ): Slice<T> {
    start = clamp(start, array.length);

    return new Slice(array, start, clamp(end, array.length) - start);
  }

  private static _empty = new Slice([], 0, 0);

  public static empty<T>(): Slice<T> {
    return this._empty;
  }

  private readonly _array: Readonly<Array<T>>;
  private readonly _offset: number;
  private readonly _length: number;

  private constructor(
    array: Readonly<Array<T>>,
    offset: number,
    length: number
  ) {
    this._array = array;
    this._offset = offset;
    this._length = length;
  }

  public get array(): Readonly<Array<T>> {
    return this._array;
  }

  public get offset(): number {
    return this._offset;
  }

  public get length(): number {
    return this._length;
  }

  public get(index: number): Option<T> {
    if (index < 0 || index >= this._length) {
      return None;
    }

    return Option.of(this._array[this._offset + index]);
  }

  public slice(start: number, end: number = this._length): Slice<T> {
    start = clamp(start, this._length);

    return new Slice(
      this._array,
      this._offset + start,
      clamp(end, this._length) - start
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (let i = this._offset, n = i + this._length; i < n; i++) {
      yield this._array[i];
    }
  }

  public equals(value: unknown): value is this {
    if (value instanceof Slice && value._length === this._length) {
      for (let i = 0, n = value._length; i < n; i++) {
        if (
          !Equatable.equals(
            value._array[value._offset + i],
            this._array[this._offset + i]
          )
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  public toArray(): Array<T> {
    return this._array.slice(this._offset, this._offset + this._length);
  }

  public toJSON(): Slice.JSON {
    return this.toArray().map(Serializable.toJSON);
  }

  public toString(): string {
    const values = this.toArray().join(", ");

    return `Slice [${values === "" ? "" : ` ${values} `}]`;
  }
}

export namespace Slice {
  export interface JSON extends Array<json.JSON> {}

  export function isSlice<T>(value: unknown): value is Slice<T> {
    return value instanceof Slice;
  }
}

function clamp(value: number, length: number): number {
  return Math.max(0, Math.min(value, length));
}
