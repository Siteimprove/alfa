import { Equatable } from "@siteimprove/alfa-equatable";
import { JSON, Serializable } from "@siteimprove/alfa-json";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Nil } from "./nil";
import { Sequence } from "./sequence";

const { not } = Predicate;

export class Cons<T> implements Sequence<T> {
  public static of<T>(
    head: T,
    tail: Lazy<Sequence<T>> = Lazy.force(Nil)
  ): Cons<T> {
    return new Cons(head, tail);
  }

  private readonly _head: T;
  private readonly _tail: Lazy<Sequence<T>>;
  private _size: Option<number> = None;

  private constructor(head: T, tail: Lazy<Sequence<T>>) {
    this._head = head;
    this._tail = tail;
  }

  public get size(): number {
    if (this._size.isNone()) {
      this._size = Option.of(1 + this._tail.force().size);
    }

    return this._size.get();
  }

  public isEmpty(): boolean {
    return false;
  }

  public map<U>(mapper: Mapper<T, U>): Sequence<U> {
    return new Cons(
      mapper(this._head),
      this._tail.map(tail => tail.map(mapper))
    );
  }

  public flatMap<U>(mapper: Mapper<T, Sequence<U>>): Sequence<U> {
    let next: Cons<T> = this;

    while (true) {
      const head = mapper(next._head);

      if (Cons.isCons<U>(head)) {
        return new Cons(
          head._head,
          head._tail.flatMap(left =>
            next._tail.map(right => left.concat(right.flatMap(mapper)))
          )
        );
      }

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return Nil;
      }
    }
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    let next: Cons<T> = this;

    while (true) {
      accumulator = reducer(accumulator, next._head);

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return accumulator;
      }
    }
  }

  public some(predicate: Predicate<T>): boolean {
    let next: Cons<T> = this;

    while (true) {
      if (predicate(next._head)) {
        return true;
      }

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return false;
      }
    }
  }

  public every(predicate: Predicate<T>): boolean {
    let next: Cons<T> = this;

    while (true) {
      if (!predicate(next._head)) {
        return false;
      }

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return true;
      }
    }
  }

  public concat(iterable: Iterable<T>): Sequence<T> {
    if (iterable === Nil) {
      return this;
    }

    return new Cons(
      this._head,
      this._tail.map(tail => tail.concat(iterable))
    );
  }

  public filter<U extends T>(predicate: Predicate<T, U>): Sequence<U> {
    let next: Cons<T> = this;

    while (true) {
      if (predicate(next._head)) {
        return new Cons(
          next._head,
          next._tail.map(tail => tail.filter(predicate))
        );
      }

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return Nil;
      }
    }
  }

  public find<U extends T>(predicate: Predicate<T, U>): Option<U> {
    let next: Cons<T> = this;

    while (true) {
      const head = next._head;

      if (predicate(head)) {
        return Option.of(head);
      }

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return None;
      }
    }
  }

  public count(predicate: Predicate<T>): number {
    return this.reduce(
      (count, value) => (predicate(value) ? count + 1 : count),
      0
    );
  }

  public get(index: number): Option<T> {
    return this.skip(index).first();
  }

  public first(): Option<T> {
    return Option.of(this._head);
  }

  public last(): Option<T> {
    let next: Cons<T> = this;

    while (true) {
      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return Option.of(next._head);
      }
    }
  }

  public take(count: number): Sequence<T> {
    return this.takeWhile(() => count-- > 0);
  }

  public takeWhile(predicate: Predicate<T>): Sequence<T> {
    return this.takeUntil(not(predicate));
  }

  public takeUntil(predicate: Predicate<T>): Sequence<T> {
    if (predicate(this._head)) {
      return Nil;
    }

    return new Cons(
      this._head,
      this._tail.map(tail => tail.takeUntil(predicate))
    );
  }

  public skip(count: number): Sequence<T> {
    return this.skipWhile(() => count-- > 0);
  }

  public skipWhile(predicate: Predicate<T>): Sequence<T> {
    let next: Cons<T> = this;

    while (predicate(next._head)) {
      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return Nil;
      }
    }

    return next;
  }

  public skipUntil(predicate: Predicate<T>): Sequence<T> {
    return this.skipWhile(not(predicate));
  }

  public rest(): Sequence<T> {
    return this._tail.force();
  }

  public slice(start: number, end?: number): Sequence<T> {
    let slice = this.skip(start);

    if (end !== undefined) {
      slice = slice.take(end - start);
    }

    return slice;
  }

  public reverse(): Sequence<T> {
    return this.reduce<Sequence<T>>(
      (reversed, value) => new Cons(value, Lazy.force(reversed)),
      Nil
    );
  }

  public groupBy<K>(grouper: Mapper<T, K>): Map<K, Sequence<T>> {
    return this.reverse().reduce((groups, value) => {
      const group = grouper(value);

      return groups.set(
        group,
        Sequence.of(
          value,
          Lazy.force(groups.get(group).getOrElse(() => Sequence.empty<T>()))
        )
      );
    }, Map.empty<K, Sequence<T>>());
  }

  public join(separator: string): string {
    let result = `${this._head}`;

    let next: Cons<T> = this;

    while (true) {
      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        result += `${separator}${tail._head}`;
      } else {
        return result;
      }
    }
  }

  public equals(value: unknown): value is this {
    if (!Cons.isCons<T>(value)) {
      return false;
    }

    let a: Cons<T> = this;
    let b: Cons<T> = value;

    while (true) {
      if (!Equatable.equals(a._head, b._head)) {
        return false;
      }

      const ta = a._tail.force();
      const tb = b._tail.force();

      if (Cons.isCons<T>(ta) && Cons.isCons<T>(tb)) {
        a = ta;
        b = tb;
      } else {
        return ta === Nil && tb === Nil;
      }
    }
  }

  public *iterator(): Iterator<T> {
    let next: Cons<T> = this;

    while (true) {
      yield next._head;

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        break;
      }
    }
  }

  public [Symbol.iterator](): Iterator<T> {
    return this.iterator();
  }

  public toArray(): Array<T> {
    const array: Array<T> = [];

    let next: Cons<T> = this;

    while (true) {
      array.push(next._head);

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return array;
      }
    }
  }

  public toJSON(): Array<JSON> {
    const json: Array<JSON> = [];

    let next: Cons<T> = this;

    while (true) {
      json.push(Serializable.toJSON(next._head));

      const tail = next._tail.force();

      if (Cons.isCons<T>(tail)) {
        next = tail;
      } else {
        return json;
      }
    }
  }

  public toString(): string {
    const values = this.join(", ");

    return `Sequence [${values === "" ? "" : ` ${values} `}]`;
  }
}

/**
 * @internal
 */
export namespace Cons {
  export function isCons<T>(value: unknown): value is Cons<T> {
    return value instanceof Cons;
  }
}
