import { Callback } from "@siteimprove/alfa-callback";
import type { Collection } from "@siteimprove/alfa-collection";
import {
  Comparable,
  type Comparer,
  Comparison,
} from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { None } from "@siteimprove/alfa-option";

import { Sequence } from "./sequence.js";
import { Cons } from "./cons.js";

/**
 * @public
 */
export interface Nil extends Sequence<never> {}

/**
 * @public
 */
export const Nil: Nil = new (class Nil {
  public get size(): number {
    return 0;
  }

  public isEmpty(): this is Sequence<never> {
    return true;
  }

  public forEach(): void {}

  public map(): Nil {
    return this;
  }

  public apply(): Nil {
    return this;
  }

  public flatMap(): Nil {
    return this;
  }

  public flatten(): Nil {
    return this;
  }

  public reduce<U>(reducer: unknown, accumulator: U): U {
    return accumulator;
  }

  public reduceWhile<U>(
    predicate: unknown,
    reducer: unknown,
    accumulator: U,
  ): U {
    return accumulator;
  }

  public reduceUntil<U>(
    predicate: unknown,
    reducer: unknown,
    accumulator: U,
  ): U {
    return accumulator;
  }

  public filter(): Nil {
    return this;
  }

  public reject(): Nil {
    return this;
  }

  public find(): None {
    return None;
  }

  public includes(): boolean {
    return false;
  }

  public collect(): Nil {
    return this;
  }

  public collectFirst(): None {
    return None;
  }

  public some(): boolean {
    return false;
  }

  public none(): boolean {
    return true;
  }

  public every(): boolean {
    return true;
  }

  public count(): number {
    return 0;
  }

  public distinct(): Nil {
    return this;
  }

  public get(): None {
    return None;
  }

  public has(): boolean {
    return false;
  }

  public set(): Nil {
    return this;
  }

  public insert<T>(index: number, value: T): Sequence<T> {
    return index === 0 ? Cons.of(value) : this;
  }

  public append<T>(value: T): Sequence<T> {
    return Cons.of(value);
  }

  public prepend<T>(value: T): Sequence<T> {
    return Cons.of(value);
  }

  public concat<T>(iterable: Iterable<T>): Sequence<T> {
    if (iterable === this) {
      return this;
    }

    return Sequence.from(iterable);
  }

  public subtract(): Nil {
    return this;
  }

  public intersect(): Nil {
    return this;
  }

  public tee<A extends Array<unknown> = []>(
    callback: Callback<this, void, [...args: A]>,
    ...args: A
  ): this {
    callback(this, ...args);
    return this;
  }

  public zip(): Nil {
    return this;
  }

  public first(): None {
    return None;
  }

  public last(): None {
    return None;
  }

  public take(): Nil {
    return this;
  }

  public takeWhile(): Nil {
    return this;
  }

  public takeUntil(): Nil {
    return this;
  }

  public takeLast(): Nil {
    return this;
  }

  public takeLastWhile(): Nil {
    return this;
  }

  public takeLastUntil(): Nil {
    return this;
  }

  public skip(): Nil {
    return this;
  }

  public skipWhile(): Nil {
    return this;
  }

  public skipUntil(): Nil {
    return this;
  }

  public skipLast(): Nil {
    return this;
  }

  public skipLastWhile(): Nil {
    return this;
  }

  public skipLastUntil(): Nil {
    return this;
  }

  public trim(): Nil {
    return this;
  }

  public trimLeading(): Nil {
    return this;
  }

  public trimTrailing(): Nil {
    return this;
  }

  public rest(): Nil {
    return this;
  }

  public slice(): Nil {
    return this;
  }

  public reverse(): Nil {
    return this;
  }

  public join(): string {
    return "";
  }

  public sort(): Nil {
    return this;
  }

  public sortWith(): Nil {
    return this;
  }

  public compare<T>(
    this: Sequence<Comparable<T>>,
    iterable: Iterable<T>,
  ): Comparison {
    return this.compareWith(iterable, Comparable.compare);
  }

  public compareWith<T, U = T>(
    iterable: Iterable<U>,
    comparer: Comparer<T, U, [index: number]>,
  ): Comparison {
    return Iterable.compareWith(this, iterable, comparer);
  }

  public groupBy<K, T>(): Map<K, Sequence<T>> {
    return Map.empty();
  }

  public equals(value: unknown): value is this {
    return value instanceof Nil;
  }

  public hash(hash: Hash): void {
    hash.writeUint32(0);
  }

  public *iterator(): Iterator<never> {}

  public [Symbol.iterator](): Iterator<never> {
    return this.iterator();
  }

  public toArray(): Array<never> {
    return [];
  }

  public toJSON(): Nil.JSON {
    return [];
  }

  public toString(): string {
    return "Sequence []";
  }
})();

/**
 * @public
 */
export namespace Nil {
  export type JSON = Collection.Indexed.JSON<never>;
}
