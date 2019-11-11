import { Equality } from "@siteimprove/alfa-equality";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";

export class Record<T>
  implements Iterable<Record.Entries<T>>, Equality<Record<T>> {
  public static of<T>(properties: T): Record<T> {
    const keys = Object.keys(properties).sort() as Array<Record.Key<T>>;
    const values = List.from(keys.map(key => properties[key]));

    return new Record(Indices.from(keys), keys, values);
  }

  private readonly indices: Indices<T>;
  private readonly keys: Array<Record.Key<T>>;
  private readonly values: List<T[Record.Key<T>]>;

  private constructor(
    indices: Indices<T>,
    keys: Array<Record.Key<T>>,
    values: List<T[Record.Key<T>]>
  ) {
    this.indices = indices;
    this.keys = keys;
    this.values = values;
  }

  public has(key: string): key is Record.Key<T> {
    return this.indices.hasOwnProperty(key);
  }

  public get<K extends Record.Key<T>>(key: K): Option<T[K]> {
    if (!this.has(key)) {
      return None;
    }

    const i = this.indices[key];

    return this.values.get(i) as Option<T[K]>;
  }

  public set<K extends Record.Key<T>>(key: K, value: T[K]): Record<T> {
    if (!this.has(key)) {
      return this;
    }

    return new Record(
      this.indices,
      this.keys,
      this.values.set(this.indices[key], value)
    );
  }

  public equals(value: unknown): value is Record<T> {
    return (
      value instanceof Record &&
      value.keys.length === this.keys.length &&
      value.keys.every((key, i) => key === this.keys[i]) &&
      value.values.equals(this.values)
    );
  }

  public *[Symbol.iterator](): Iterator<Record.Entries<T>> {
    let i = 0;

    for (const value of this.values) {
      yield [this.keys[i++], value];
    }
  }

  public toJSON() {
    const record: { [key: string]: unknown } = {};

    for (const [key, value] of this) {
      record[key] = value;
    }

    return record;
  }
}

export namespace Record {
  export type Key<T> = Extract<keyof T, string>;

  export type Entries<T> = { [K in Key<T>]: [K, T[K]] }[Key<T>];

  export function from<T>(entries: Iterable<Entries<T>>): Record<T> {
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
