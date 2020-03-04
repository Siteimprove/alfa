import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Reducer } from "@siteimprove/alfa-reducer";
import * as json from "@siteimprove/alfa-json";

export class Record<T>
  implements
    Foldable<Record.Value<T>>,
    Iterable<Record.Entry<T>>,
    Equatable,
    Serializable {
  public static of<T>(properties: T): Record<T> {
    const keys = Object.keys(properties).sort() as Array<Record.Key<T>>;
    const values = List.from(keys.map(key => properties[key]));

    return new Record(Indices.from(keys), keys, values);
  }

  private readonly _indices: Indices<T>;
  private readonly _keys: Array<Record.Key<T>>;
  private readonly _values: List<Record.Value<T>>;

  private constructor(
    indices: Indices<T>,
    keys: Array<Record.Key<T>>,
    values: List<T[Record.Key<T>]>
  ) {
    this._indices = indices;
    this._keys = keys;
    this._values = values;
  }

  public has(key: string): key is Record.Key<T> {
    return this._indices.hasOwnProperty(key);
  }

  public get<K extends Record.Key<T>>(key: K): Option<T[K]> {
    if (!this.has(key)) {
      return None;
    }

    const i = this._indices[key];

    return this._values.get(i) as Option<T[K]>;
  }

  public set<K extends Record.Key<T>>(key: K, value: T[K]): Record<T> {
    if (!this.has(key)) {
      return this;
    }

    return new Record(
      this._indices,
      this._keys,
      this._values.set(this._indices[key], value)
    );
  }

  public reduce<R>(
    reducer: Reducer<Record.Value<T>, R, [Record.Key<T>]>,
    accumulator: R
  ): R {
    return Iterable.reduce(
      this,
      (accumulator, [key, value]) => reducer(accumulator, value, key),
      accumulator
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Record &&
      value._keys.length === this._keys.length &&
      value._keys.every((key, i) => key === this._keys[i]) &&
      value._values.equals(this._values)
    );
  }

  public *keys(): Iterable<Record.Key<T>> {
    yield* this._keys;
  }

  public *values(): Iterable<Record.Value<T>> {
    yield* this._values;
  }

  public *[Symbol.iterator](): Iterator<Record.Entry<T>> {
    let i = 0;

    for (const value of this._values) {
      yield [this._keys[i++], value];
    }
  }

  public toArray(): Array<Record.Entry<T>> {
    return [...this];
  }

  public toJSON(): Record.JSON {
    const json: { [key: string]: json.JSON } = {};

    for (const [key, value] of this) {
      json[key] = Serializable.toJSON(value);
    }

    return json;
  }

  public toString(): string {
    const entries = this.toArray()
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    return `Record {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

export namespace Record {
  export type Key<T> = Extract<keyof T, string>;

  export type Value<T> = T[Key<T>];

  export type Entry<T> = { [K in Key<T>]: [K, T[K]] }[Key<T>];

  export interface JSON {
    [key: string]: json.JSON;
  }

  export function from<T>(entries: Iterable<Entry<T>>): Record<T> {
    const record: { [key: string]: unknown } = {};

    for (const [key, value] of entries) {
      record[key] = value;
    }

    return Record.of((record as unknown) as T);
  }
}

type Indices<T> = { [K in keyof T]: number };

namespace Indices {
  export function from<T>(keys: Iterable<Record.Key<T>>): Indices<T> {
    const indices: { [key: string]: number } = {};

    let i = 0;

    for (const key of keys) {
      indices[key] = i++;
    }

    return indices as Indices<T>;
  }
}
