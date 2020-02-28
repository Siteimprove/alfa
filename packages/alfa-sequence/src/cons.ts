import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { JSON, Serializable } from "@siteimprove/alfa-json";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Nil } from "./nil";
import { Sequence } from "./sequence";

/**
 * @internal
 */
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
            this._tail.map(right => left.concat(right.flatMap(mapper)))
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
    return Iterable.reduce(this, reducer, accumulator);
  }

  public some(predicate: Predicate<T>): boolean {
    return Iterable.some(this, predicate);
  }

  public every(predicate: Predicate<T>): boolean {
    return Iterable.every(this, predicate);
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
    return Sequence.from(Iterable.filter(this, predicate));
  }

  public find<U extends T>(predicate: Predicate<T, U>): Option<U> {
    return Iterable.find(this, predicate);
  }

  public count(predicate: Predicate<T>): number {
    return Iterable.count(this, predicate);
  }

  public get(index: number): Option<T> {
    return Iterable.get(this, index);
  }

  public first(): Option<T> {
    return Option.of(this._head);
  }

  public last(): Option<T> {
    return Iterable.last(this);
  }

  public take(count: number): Sequence<T> {
    return Sequence.from(Iterable.take(this, count));
  }

  public takeWhile(predicate: Predicate<T>): Sequence<T> {
    return Sequence.from(Iterable.takeWhile(this, predicate));
  }

  public takeUntil(predicate: Predicate<T>): Sequence<T> {
    return Sequence.from(Iterable.takeUntil(this, predicate));
  }

  public skip(count: number): Sequence<T> {
    return Sequence.from(Iterable.skip(this, count));
  }

  public skipWhile(predicate: Predicate<T>): Sequence<T> {
    return Sequence.from(Iterable.skipWhile(this, predicate));
  }

  public skipUntil(predicate: Predicate<T>): Sequence<T> {
    return Sequence.from(Iterable.skipUntil(this, predicate));
  }

  public rest(): Sequence<T> {
    return this._tail.force();
  }

  public slice(start: number, end?: number): Sequence<T> {
    return Sequence.from(Iterable.slice(this, start, end));
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
    return Iterable.join(this, separator);
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

  public toJSON(): Array<JSON> {
    return [...Iterable.map(this, Serializable.toJSON)];
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
