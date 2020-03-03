import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Thunk } from "@siteimprove/alfa-thunk";

/**
 * @see http://blog.higher-order.com/assets/trampolines.pdf
 */
export abstract class Trampoline<T> implements Monad<T>, Functor<T> {
  protected abstract step(): Trampoline<T>;

  public run(): T {
    let step: Trampoline<T> = this;

    while (true) {
      const next = step.step();

      if (step !== next) {
        step = next;
      } else {
        return next.run();
      }
    }
  }

  public isDone(): boolean {
    return this instanceof Done;
  }

  public isSuspended(): boolean {
    return this instanceof Suspend || this instanceof Bind;
  }

  public map<U>(mapper: Mapper<T, U>): Trampoline<U> {
    return this.flatMap(value => Done.of(mapper(value)));
  }

  public abstract flatMap<U>(mapper: Mapper<T, Trampoline<U>>): Trampoline<U>;
}

export namespace Trampoline {
  export function isTrampoline<T>(value: unknown): value is Trampoline<T> {
    return value instanceof Trampoline;
  }

  export function done<T>(value: T): Trampoline<T> {
    return Done.of(value);
  }

  export function suspend<T>(thunk: Thunk<Trampoline<T>>): Trampoline<T> {
    return Suspend.of(thunk);
  }

  export function delay<T>(thunk: Thunk<T>): Trampoline<T> {
    return suspend(() => done(thunk()));
  }

  export function traverse<T, U>(
    values: Iterable<T>,
    mapper: Mapper<T, Trampoline<U>>
  ): Trampoline<Iterable<U>> {
    return Iterable.reduce(
      values,
      (values, value) =>
        mapper(value).flatMap(value =>
          values.map(values => values.push(value))
        ),
      done(List.empty())
    );
  }

  export function sequence<T>(
    futures: Iterable<Trampoline<T>>
  ): Trampoline<Iterable<T>> {
    return traverse(futures, value => value);
  }
}

class Done<T> extends Trampoline<T> {
  public static of<T>(value: T): Done<T> {
    return new Done(value);
  }

  private readonly _value: T;

  private constructor(value: T) {
    super();
    this._value = value;
  }

  protected step(): Trampoline<T> {
    return this;
  }

  public run(): T {
    return this._value;
  }

  public map<U>(mapper: Mapper<T, U>): Trampoline<U> {
    return new Done(mapper(this._value));
  }

  public flatMap<U>(mapper: Mapper<T, Trampoline<U>>): Trampoline<U> {
    return Suspend.of(() => mapper(this._value));
  }
}

class Suspend<T> extends Trampoline<T> {
  public static of<T>(thunk: Thunk<Trampoline<T>>): Suspend<T> {
    return new Suspend(thunk);
  }

  private readonly _thunk: Thunk<Trampoline<T>>;

  private constructor(thunk: Thunk<Trampoline<T>>) {
    super();
    this._thunk = thunk;
  }

  protected step(): Trampoline<T> {
    return this._thunk();
  }

  public flatMap<U>(mapper: Mapper<T, Trampoline<U>>): Trampoline<U> {
    return Bind.of(this._thunk, mapper);
  }
}

class Bind<S, T> extends Trampoline<T> {
  public static of<S, T>(
    thunk: Thunk<Trampoline<S>>,
    mapper: Mapper<S, Trampoline<T>>
  ): Bind<S, T> {
    return new Bind(thunk, mapper);
  }

  private readonly _thunk: Thunk<Trampoline<S>>;
  private readonly _mapper: Mapper<S, Trampoline<T>>;

  private constructor(
    thunk: Thunk<Trampoline<S>>,
    mapper: Mapper<S, Trampoline<T>>
  ) {
    super();
    this._thunk = thunk;
    this._mapper = mapper;
  }

  protected step(): Trampoline<T> {
    return this._thunk().flatMap(this._mapper);
  }

  public flatMap<U>(mapper: Mapper<T, Trampoline<U>>): Trampoline<U> {
    return Suspend.of(() =>
      Bind.of(this._thunk, value => this._mapper(value).flatMap(mapper))
    );
  }
}
