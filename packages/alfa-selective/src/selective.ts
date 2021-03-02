import { Either, Left, Right } from "@siteimprove/alfa-either";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

export class Selective<S, T = never>
  implements
    Functor<T>,
    Iterable<S | T>,
    Equatable,
    Hashable,
    Serializable<Selective.JSON<S, T>> {
  public static of<T>(value: T): Selective<T> {
    return new Selective(Left.of(value));
  }

  private readonly _value: Either<S, T>;

  private constructor(value: Either<S, T>) {
    this._value = value;
  }

  public map<U>(mapper: Mapper<T, U>): Selective<S, U> {
    return new Selective(
      this._value.either(
        (value) => Left.of(value) as Either<S, U>,
        (value) => Right.of(mapper(value))
      )
    );
  }

  public nest<P extends S, U>(
    refinement: Refinement<S, P>,
    mapper: Mapper<Selective<P>, Selective<never, U>>
  ): Selective<Exclude<S, P>, T | U>;

  public nest<U>(
    predicate: Predicate<S>,
    mapper: Mapper<Selective<S>, Selective<never, U>>
  ): Selective<S, T | U>;

  public nest<U>(
    predicate: Predicate<S>,
    mapper: Mapper<Selective<S>, Selective<never, U>>
  ): Selective<S, T | U> {
    return this._value.either(
      (value) =>
        predicate(value)
          ? new Selective(Right.of(mapper(new Selective(Left.of(value))).get()))
          : this,
      () => this
    );
  }

  public if<P extends S, U>(
    refinement: Refinement<S, P>,
    mapper: Mapper<P, U>
  ): Selective<Exclude<S, P>, T | U>;

  public if<U>(
    predicate: Predicate<S>,
    mapper: Mapper<S, U>
  ): Selective<S, T | U>;

  public if<U>(
    predicate: Predicate<S>,
    mapper: Mapper<S, U>
  ): Selective<S, T | U> {
    return this._value.either(
      (value) =>
        predicate(value) ? new Selective(Right.of(mapper(value))) : this,
      () => this
    );
  }

  public else<U>(mapper: Mapper<S, U>): Selective<never, T | U> {
    return new Selective<never, T | U>(
      Right.of(
        this._value.either<T | U>(
          (value) => mapper(value),
          (value) => value
        )
      )
    );
  }

  public get(): S | T {
    return this._value.get();
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

export namespace Selective {
  export type JSON<S, T = never> = Either.JSON<S, T>;
}
