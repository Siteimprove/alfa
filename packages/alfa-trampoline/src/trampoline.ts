import { Either, Left, Right } from "@siteimprove/alfa-either";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Thunk } from "@siteimprove/alfa-thunk";

/**
 * @see http://blog.higher-order.com/assets/trampolines.pdf
 */
export abstract class Trampoline<T> implements Monad<T>, Functor<T> {
  /**
   * @internal
   */
  public abstract step(): Either<Trampoline<T>, T>;

  public isDone(): boolean {
    return this instanceof Done;
  }

  public isSuspended(): boolean {
    return this instanceof Suspend;
  }

  public run(): T {
    let result = this.step();

    while (result.isLeft()) {
      result = result.get().step();
    }

    return result.get() as T;
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

  public step(): Right<T> {
    return Right.of(this._value);
  }

  public run(): T {
    return this._value;
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

  public step(): Left<Trampoline<T>> {
    return Left.of(this._thunk());
  }

  public flatMap<U>(mapper: Mapper<T, Trampoline<U>>): Trampoline<U> {
    return Suspend.Bind.of(this._thunk, mapper);
  }
}

namespace Suspend {
  export class Bind<S, T> extends Trampoline<T> {
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

    public step(): Either<Trampoline<T>, T> {
      return this._thunk()
        .flatMap(this._mapper)
        .step();
    }

    public flatMap<U>(mapper: Mapper<T, Trampoline<U>>): Trampoline<U> {
      return this._thunk().flatMap(value =>
        this._mapper(value).flatMap(mapper)
      );
    }
  }
}
