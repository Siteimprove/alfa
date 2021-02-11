import { Equatable } from "@siteimprove/alfa-equatable";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import * as json from "@siteimprove/alfa-json";

export class Record<T>
  implements
    Foldable<Record.Value<T>>,
    Iterable<Record.Entry<T>>,
    Equatable,
    Serializable<Record.JSON<T>> {
  public static of<T>(properties: T): Record<T> {
    const keys = Object.keys(properties).sort() as Array<Record.Key<T>>;

    return new Record(
      new Map(Iterable.map(keys, (key, i) => [key, i])),
      keys,
      List.from(keys.map((key) => properties[key]))
    );
  }

  private readonly _indices: ReadonlyMap<string, number>;
  private readonly _keys: ReadonlyArray<Record.Key<T>>;
  private readonly _values: List<Record.Value<T>>;

  private constructor(
    indices: ReadonlyMap<string, number>,
    keys: ReadonlyArray<Record.Key<T>>,
    values: List<T[Record.Key<T>]>
  ) {
    this._indices = indices;
    this._keys = keys;
    this._values = values;
  }

  public has(key: string): key is Record.Key<T> {
    return this._indices.has(key);
  }

  public get<K extends Record.Key<T>>(key: K): Option<T[K]> {
    const i = this._indices.get(key);

    if (i === undefined) {
      return None;
    }

    return this._values.get(i) as Option<T[K]>;
  }

  public set<K extends Record.Key<T>>(key: K, value: T[K]): Record<T> {
    const i = this._indices.get(key);

    if (i === undefined) {
      return this;
    }

    return new Record(this._indices, this._keys, this._values.set(i, value));
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

  public some(predicate: Predicate<Record.Value<T>, [Record.Key<T>]>): boolean {
    return Iterable.some(this, ([key, value]) => predicate(value, key));
  }

  public every(
    predicate: Predicate<Record.Value<T>, [Record.Key<T>]>
  ): boolean {
    return Iterable.every(this, ([key, value]) => predicate(value, key));
  }

  public equals(value: Record<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
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

  public *entries(): Iterable<Record.Entry<T>> {
    yield* this;
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

  public toJSON(): Record.JSON<T> {
    const json: { [key: string]: json.JSON } = {};

    for (const [key, value] of this) {
      json[key] = Serializable.toJSON(value);
    }

    return json as Record.JSON<T>;
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

  export type JSON<T> = { [K in Key<T>]: Serializable.ToJSON<T[K]> };

  export function isRecord<T>(value: unknown): value is Record<T> {
    return value instanceof Record;
  }

  export function from<T>(entries: Iterable<Entry<T>>): Record<T> {
    const record = {} as { [K in Key<T>]: T[K] };

    for (const [key, value] of entries) {
      record[key] = value;
    }

    return Record.of(record as T);
  }
}
