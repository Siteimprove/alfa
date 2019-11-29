import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Sequence } from "@siteimprove/alfa-sequence";

export class Future<T> implements Monad<T>, Functor<T> {
  public static of<T>(settler: (settle: Future.Settle<T>) => void): Future<T> {
    return new Future(settler);
  }

  private _value: Option<T> = None;
  private _subscribers: Array<Future.Settle<unknown>> = [];

  private constructor(settler: (settle: Future.Settle<T>) => void) {
    settler(value => {
      this.settle(value);
    });
  }

  private settle(value: T): void {
    if (this._value.isNone()) {
      this._value = Some.of(value);

      for (const subscriber of this._subscribers) {
        subscriber(value);
      }

      this._subscribers = [];
    }
  }

  private subscribe(settle: Future.Settle<T>): void {
    if (this._value.isSome()) {
      settle(this._value.get());
    } else {
      this._subscribers.push(settle as Future.Settle<unknown>);
    }
  }

  public map<U>(mapper: Mapper<T, U>): Future<U> {
    return new Future<U>(settle => {
      this.subscribe(value => {
        settle(mapper(value));
      });
    });
  }

  public flatMap<U>(mapper: Mapper<T, Future<U>>): Future<U> {
    return new Future<U>(settle => {
      this.subscribe(value => {
        mapper(value).subscribe(settle);
      });
    });
  }

  public then<U>(settled: Mapper<T, U>): Future<U> {
    return this.map(settled);
  }

  public get(): Option<T> {
    return this._value;
  }

  public toJSON() {
    return this._value.toJSON();
  }
}

export namespace Future {
  export type Settle<T> = (value: T) => void;

  export function isFuture<T>(value: unknown): value is Future<T> {
    return value instanceof Future;
  }

  export function from<T>(promise: Promise<T>): Future<T> {
    return Future.of(settle => {
      promise.then(settle);
    });
  }

  export function settle<T>(value: T): Future<T> {
    return Future.of(settle => {
      settle(value);
    });
  }

  export function traverse<T, U>(
    values: Iterable<T>,
    mapper: Mapper<T, Future<U>>
  ): Future<Iterable<U>> {
    return Sequence.from(values)
      .reverse()
      .reduce(
        (values, value) =>
          values.flatMap(values =>
            mapper(value).map(value => Sequence.of(value, values))
          ),
        Future.settle(Sequence.empty())
      );
  }

  export function sequence<T>(
    futures: Iterable<Future<T>>
  ): Future<Iterable<T>> {
    return traverse(futures, value => value);
  }
}
