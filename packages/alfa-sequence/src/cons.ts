import { Equality } from "@siteimprove/alfa-equality";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Nil } from "./nil";
import { Sequence } from "./sequence";

/**
 * @internal
 */
export class Cons<T> implements Sequence<T> {
  public static of<T>(
    head: T,
    tail: Thunk<Sequence<T>> | Sequence<T> = Nil
  ): Cons<T> {
    return new Cons(head, tail);
  }

  private readonly _head: T;
  private _tail: Thunk<Sequence<T>> | Sequence<T>;
  private _length?: number;

  private constructor(head: T, tail: Thunk<Sequence<T>> | Sequence<T>) {
    this._head = head;
    this._tail = tail;
  }

  private get tail(): Sequence<T> {
    if (typeof this._tail === "function") {
      this._tail = this._tail();
    }

    return this._tail;
  }

  public get length(): number {
    if (this._length === undefined) {
      this._length = 1 + this.tail.length;
    }

    return this._length;
  }

  public isEmpty(): boolean {
    return false;
  }

  public map<U>(mapper: Mapper<T, U>): Sequence<U> {
    const tail = () => this.tail.map(mapper);

    return new Cons(mapper(this._head), tail);
  }

  public flatMap<U>(mapper: Mapper<T, Sequence<U>>): Sequence<U> {
    const sequence = mapper(this._head);

    if (Cons.isCons<U>(sequence)) {
      const tail = () => sequence.tail.concat(this.tail.flatMap(mapper));

      return new Cons(sequence._head, tail);
    }

    return this.tail.flatMap(mapper);
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

    const tail = () => this.tail.concat(iterable);

    return new Cons(this._head, tail);
  }

  public filter<U extends T>(predicate: Predicate<T, U>): Sequence<U> {
    return Sequence.from(Iterable.filter(this, predicate));
  }

  public find<U extends T>(predicate: Predicate<T, U>): Option<U> {
    return Iterable.find(this, predicate);
  }

  public get(index: number): Option<T> {
    return Iterable.get(this, index);
  }

  public first(): Option<T> {
    return Option.of(this._head);
  }

  public last(): Option<T> {
    if (this.tail === Nil) {
      return Option.of(this._head);
    }

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
    return this.tail;
  }

  public slice(start: number, end?: number): Sequence<T> {
    return Sequence.from(Iterable.slice(this, start, end));
  }

  public reverse(): Sequence<T> {
    return this.reduce<Sequence<T>>(
      (reversed, value) => new Cons(value, reversed),
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
          groups.get(group).getOrElse(() => Sequence.empty<T>())
        )
      );
    }, Map.empty<K, Sequence<T>>());
  }

  public join(separator: string): string {
    return Iterable.join(this, separator);
  }

  public equals(value: unknown): value is Cons<T> {
    return (
      value instanceof Cons &&
      Equality.equals(value._head, this._head) &&
      value.tail.equals(this.tail)
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    let next: Cons<T> = this;

    while (true) {
      yield next._head;

      if (Cons.isCons<T>(next.tail)) {
        next = next.tail;
      } else {
        break;
      }
    }
  }

  public toJSON(): Array<T> {
    return [...this];
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
