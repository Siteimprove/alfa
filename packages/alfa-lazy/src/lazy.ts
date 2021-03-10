import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Trampoline } from "@siteimprove/alfa-trampoline";

/**
 * @public
 */
export class Lazy<T>
  implements
    Functor<T>,
    Monad<T>,
    Iterable<T>,
    Equatable,
    Serializable<Lazy.JSON<T>> {
  public static of<T>(thunk: Thunk<T>): Lazy<T> {
    return new Lazy(Trampoline.delay(thunk));
  }

  public static force<T>(value: T): Lazy<T> {
    return new Lazy(Trampoline.done(value));
  }

  private _value: Trampoline<T>;

  private constructor(value: Trampoline<T>) {
    this._value = value;
  }

  public force(): T {
    if (this._value.isSuspended()) {
      this._value = Trampoline.done(this._value.run());
    }

    return this._value.run();
  }

  public map<U>(mapper: Mapper<T, U>): Lazy<U> {
    return new Lazy(
      this._value.flatMap((value) => {
        if (this._value.isSuspended()) {
          this._value = Trampoline.done(value);
        }

        return Trampoline.done(mapper(value));
      })
    );
  }

  public flatMap<U>(mapper: Mapper<T, Lazy<U>>): Lazy<U> {
    return new Lazy(
      this._value.flatMap((value) => {
        if (this._value.isSuspended()) {
          this._value = Trampoline.done(value);
        }

        return mapper(value)._value;
      })
    );
  }

  public equals<T>(value: Lazy<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Lazy && Equatable.equals(value.force(), this.force())
    );
  }

  public *iterator(): Iterator<T> {
    yield this.force();
  }

  public [Symbol.iterator](): Iterator<T> {
    return this.iterator();
  }

  public toThunk(): Thunk<T> {
    return () => this.force();
  }

  public toJSON(): Lazy.JSON<T> {
    return Serializable.toJSON(this.force());
  }

  public toString(): string {
    return `Lazy { ${this.force()} }`;
  }
}

/**
 * @public
 */
export namespace Lazy {
  export type JSON<T> = Serializable.ToJSON<T>;
}
