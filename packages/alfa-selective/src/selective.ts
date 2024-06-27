import type { Applicative } from "@siteimprove/alfa-applicative";
import type { Callback } from "@siteimprove/alfa-callback";
import { Either, Left, Right } from "@siteimprove/alfa-either";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Functor } from "@siteimprove/alfa-functor";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Monad } from "@siteimprove/alfa-monad";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

/**
 * {@link https://www.staff.ncl.ac.uk/andrey.mokhov/selective-functors.pdf}
 *
 * @public
 */
export class Selective<S, T = never>
  implements
    Functor<T>,
    Applicative<T>,
    Monad<T>,
    Iterable<S | T>,
    Equatable,
    Hashable,
    Serializable<Selective.JSON<S, T>>
{
  public static of<T>(value: T): Selective<T> {
    return new Selective(Left.of(value));
  }

  private readonly _value: Either<S, T>;

  private constructor(value: Either<S, T>) {
    this._value = value;
  }

  public map<U>(mapper: Mapper<T, U>): Selective<S, U> {
    return new Selective(this._value.map(mapper));
  }

  public apply<U>(mapper: Selective<S, Mapper<T, U>>): Selective<S, U> {
    return mapper.flatMap((mapper) => this.map(mapper));
  }

  public flatMap<U>(mapper: Mapper<T, Selective<S, U>>): Selective<S, U> {
    return new Selective(this._value.flatMap((value) => mapper(value)._value));
  }

  public flatten<S, T>(this: Selective<S, Selective<S, T>>): Selective<S, T> {
    return this.flatMap((selective) => selective);
  }

  public if<P, Q extends P, U>(
    refinement: Refinement<P, Q>,
    mapper: Mapper<S & Q, U>,
  ): Selective<Exclude<S, Q>, T | U>;

  public if<U>(
    predicate: Predicate<S>,
    mapper: Mapper<S, U>,
  ): Selective<S, T | U>;

  public if<U>(
    predicate: Predicate<S>,
    mapper: Mapper<S, U>,
  ): Selective<S, T | U> {
    return this._value.either(
      (value) =>
        predicate(value) ? new Selective<S, U>(Right.of(mapper(value))) : this,
      () => this,
    );
  }

  public ifGuarded<P, Q extends P, R extends Q, U>(
    predicate: Refinement<P, Q>,
    guard: Refinement<Q, R>,
    ifTrue: Mapper<S & R, U>,
    ifFalse: Mapper<S & Q, U>,
  ): Selective<Exclude<S, Q>, T | U>;

  public ifGuarded<P, Q extends P, U>(
    predicate: Refinement<P, Q>,
    guard: Predicate<S & Q>,
    ifTrue: Mapper<S & Q, U>,
    ifFalse: Mapper<S & Q, U>,
  ): Selective<Exclude<S, Q>, T | U>;

  public ifGuarded<U>(
    predicate: Predicate<S>,
    guard: Predicate<S>,
    ifTrue: Mapper<S, U>,
    ifFalse: Mapper<S, U>,
  ): Selective<S, T | U>;

  public ifGuarded<U>(
    predicate: Predicate<S>,
    guard: Predicate<S>,
    ifTrue: Mapper<S, U>,
    ifFalse: Mapper<S, U>,
  ): Selective<S, T | U> {
    return this._value.either(
      (value) =>
        predicate(value)
          ? guard(value)
            ? new Selective<S, U>(Right.of(ifTrue(value)))
            : new Selective<S, U>(Right.of(ifFalse(value)))
          : this,
      () => this,
    );
  }

  public else<U>(mapper: Mapper<S, U>): Selective<never, T | U> {
    return new Selective<never, T | U>(
      Right.of(
        this._value.either<T | U>(
          (value) => mapper(value),
          (value) => value,
        ),
      ),
    );
  }

  public get(): S | T {
    return this._value.get();
  }

  /**
   * Ensure that this {@link (Selective:class)} is exhaustively matched,
   * returning its resulting value.
   *
   * @remarks
   * This method should only be used for cases where
   * {@link (Selective:class).get} is insufficient. If in doubt, assume that
   * it isn't.
   */
  public exhaust<T>(this: Selective<never, T>): T {
    return this.get();
  }

  public tee<A extends Array<unknown> = []>(
    left: Callback<S, void, A>,
    right: Callback<T, void, A>,
    ...args: A
  ): this {
    this._value.either(
      (value) => left(value, ...args),
      (value) => right(value, ...args),
    );
    return this;
  }

  public equals<S, T>(value: Selective<S, T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Selective && value._value.equals(this._value);
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._value);
  }

  public *iterator(): Iterator<S | T> {
    yield this._value.get();
  }

  public [Symbol.iterator](): Iterator<S | T> {
    return this.iterator();
  }

  public toJSON(): Selective.JSON<S, T> {
    return this._value.toJSON();
  }

  public toString(): string {
    return `Selective { ${this._value} }`;
  }
}

/**
 * @public
 */
export namespace Selective {
  export type JSON<S, T = never> = Either.JSON<S, T>;
}
