import { Equality } from "@siteimprove/alfa-equality";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Trampoline } from "@siteimprove/alfa-trampoline";

export class Lazy<T> implements Monad<T>, Functor<T>, Equality<Lazy<T>> {
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
    return new Lazy(this._value.map(mapper));
  }

  public flatMap<U>(mapper: Mapper<T, Lazy<U>>): Lazy<U> {
    return new Lazy(this._value.flatMap(value => mapper(value)._value));
  }

  public equals(value: unknown): value is Lazy<T> {
    return (
      value instanceof Lazy && Equality.equals(value.force(), this.force())
    );
  }

  public toThunk(): Thunk<T> {
    return () => this.force();
  }
}
