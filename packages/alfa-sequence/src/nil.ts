import { Map } from "@siteimprove/alfa-map";
import { None } from "@siteimprove/alfa-option";

import { Sequence } from "./sequence";

/**
 * @internal
 */
export interface Nil extends Sequence<never> {}

/**
 * @internal
 */
export const Nil: Nil = new (class Nil {
  public get size(): number {
    return 0;
  }

  public isEmpty(): this is Nil {
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

  public some(): boolean {
    return false;
  }

  public every(): boolean {
    return true;
  }

  public concat<T>(iterable: Iterable<T>): Sequence<T> {
    if (iterable === this) {
      return this;
    }

    return Sequence.from(iterable);
  }

  public filter(): Nil {
    return this;
  }

  public find(): None {
    return None;
  }

  public get(): None {
    return None;
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

  public skip(): Nil {
    return this;
  }

  public skipWhile(): Nil {
    return this;
  }

  public skipUntil(): Nil {
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

  public *[Symbol.iterator](): Iterator<never> {}

  public toJSON() {
    return [];
  }

  public toString(): string {
    return "Sequence []";
  }
})();
