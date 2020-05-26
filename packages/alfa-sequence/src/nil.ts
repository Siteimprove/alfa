import { Map } from "@siteimprove/alfa-map";
import { None } from "@siteimprove/alfa-option";

import { Sequence } from "./sequence";
import { Cons } from "./cons";

export interface Nil extends Sequence<never> {}

export const Nil: Nil = new (class Nil {
  public get size(): number {
    return 0;
  }

  public isEmpty(): this is Sequence<never> {
    return true;
  }

  public map(): Nil {
    return this;
  }

  public flatMap(): Nil {
    return this;
  }

  public reduce<U>(reducer: unknown, accumulator: U): U {
    return accumulator;
  }

  public apply(): Nil {
    return this;
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

  public some(): boolean {
    return false;
  }

  public every(): boolean {
    return true;
  }

  public count(): number {
    return 0;
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

  public rest(): Nil {
    return this;
  }

  public slice(): Nil {
    return this;
  }

  public reverse(): Nil {
    return this;
  }

  public groupBy<K, T>(): Map<K, Sequence<T>> {
    return Map.empty();
  }

  public join(): string {
    return "";
  }

  public equals(value: unknown): value is this {
    return value instanceof Nil;
  }

  public hash(): void {}

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

export namespace Nil {
  export type JSON = Array<never>;
}
