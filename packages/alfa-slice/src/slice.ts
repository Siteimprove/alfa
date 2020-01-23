import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import * as json from "@siteimprove/alfa-json";

export class Slice<T> implements Iterable<T>, Serializable {
  public static of<T>(
    array: Readonly<Array<T>>,
    start: number = 0,
    end: number = array.length
  ): Slice<T> {
    start = clamp(start, array.length);

    return new Slice(array, start, clamp(end, array.length) - start);
  }

  public readonly array: Readonly<Array<T>>;
  public readonly offset: number;
  public readonly length: number;

  private constructor(
    array: Readonly<Array<T>>,
    offset: number,
    length: number
  ) {
    this.array = array;
    this.offset = offset;
    this.length = length;
  }

  public get(index: number): Option<T> {
    if (index < 0 || index >= this.length) {
      return None;
    }

    return Option.of(this.array[this.offset + index]);
  }

  public slice(start: number, end: number = this.length): Slice<T> {
    start = clamp(start, this.length);

    return new Slice(
      this.array,
      this.offset + start,
      clamp(end, this.length) - start
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (let i = this.offset, n = i + this.length; i < n; i++) {
      yield this.array[i];
    }
  }

  public toJSON(): Slice.JSON {
    return [...Iterable.map(this, Serializable.toJSON)];
  }

  public toString(): string {
    const values = [...this].join(", ");

    return `Slice [${values === "" ? "" : ` ${values} `}]`;
  }
}

export namespace Slice {
  export function isSlice<T>(value: unknown): value is Slice<T> {
    return value instanceof Slice;
  }

  export interface JSON extends Array<json.JSON> {}
}

function clamp(value: number, length: number): number {
  return Math.max(0, Math.min(value, length));
}
