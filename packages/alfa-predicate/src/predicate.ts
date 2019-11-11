import { Equality } from "@siteimprove/alfa-equality";
import { Mapper } from "@siteimprove/alfa-mapper";

export type Predicate<
  T,
  U extends T = T,
  A extends Array<unknown> = Array<unknown>
> =
  | ((value: T, ...args: A) => boolean)
  | ((value: T, ...args: A) => value is U);

export namespace Predicate {
  export function fold<T, U extends T, V>(
    predicate: Predicate<T, U>,
    value: T,
    ifTrue: Mapper<U, V>,
    ifFalse: Mapper<T, V>
  ): V {
    return is<T, U>(value, predicate(value)) ? ifTrue(value) : ifFalse(value);
  }

  export function test<T, U extends T>(
    predicate: Predicate<T, U>,
    value: T
  ): value is U {
    return predicate(value);
  }

  export function not<T, U extends T>(
    predicate: Predicate<T, U>
  ): Predicate<T> {
    return value => fold(predicate, value, contradiction, tautology);
  }

  export function and<T, U extends T, V extends U>(
    left: Predicate<T, U>,
    right: Predicate<U, V>
  ): Predicate<T, V> {
    return value => fold(left, value, right, contradiction);
  }

  export function or<T, U extends T, V extends T>(
    left: Predicate<T, U>,
    right: Predicate<T, V>
  ): Predicate<T, U | V> {
    return value => fold(left, value, tautology, right);
  }

  export function xor<T, U extends T, V extends T>(
    left: Predicate<T, U>,
    right: Predicate<T, V>
  ): Predicate<T, U | V> {
    return value => fold(left, value, not(right), right);
  }

  export function equals<T>(value: Equality<T>): Predicate<unknown, T>;

  export function equals<T>(value: T): Predicate<unknown, T>;

  export function equals<T>(value: T): Predicate<unknown, T> {
    return other => Equality.equals(other, value);
  }

  export class Chain<T, U extends T = T> {
    public static of<T, U extends T>(predicate: Predicate<T, U>): Chain<T, U> {
      return new Chain(predicate);
    }

    private readonly predicate: Predicate<T, U>;

    private constructor(predicate: Predicate<T, U>) {
      this.predicate = predicate;
    }

    public get(): Predicate<T, U> {
      return this.predicate;
    }

    public fold<V>(value: T, ifTrue: Mapper<U, V>, ifFalse: Mapper<T, V>): V {
      return fold(this.predicate, value, ifTrue, ifFalse);
    }

    public test(value: T): value is U {
      return this.predicate(value);
    }

    public and<V extends U>(predicate: Predicate<U, V>): Chain<T, V> {
      return new Chain(and(this.predicate, predicate));
    }

    public or<V extends T>(predicate: Predicate<T, V>): Chain<T, U | V> {
      return new Chain(or(this.predicate, predicate));
    }
  }

  export function chain<T>(): Chain<T>;

  export function chain<T, U extends T = T>(
    predicate: Predicate<T, U>
  ): Chain<T, U>;

  export function chain<T>(predicate: Predicate<T> = tautology): Chain<T> {
    return Chain.of(predicate);
  }
}

function is<T, U extends T>(value: T, ok: boolean): value is U {
  return ok;
}

function tautology(): true {
  return true;
}

function contradiction(): false {
  return false;
}
