import { Declaration } from "@siteimprove/alfa-dom";
import { Equality } from "@siteimprove/alfa-equality";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";

export class Value<T = unknown>
  implements Monad<T>, Functor<T>, Iterable<T>, Equality<Value<T>> {
  public static of<T>(value: T, source: Option<Declaration>): Value<T> {
    return new Value(value, source);
  }

  public readonly value: T;
  public readonly source: Option<Declaration>;

  private constructor(value: T, source: Option<Declaration>) {
    this.value = value;
    this.source = source;
  }

  public map<U>(mapper: Mapper<T, U>): Value<U> {
    return new Value(mapper(this.value), this.source);
  }

  public flatMap<U>(mapper: Mapper<T, Value<U>>): Value<U> {
    return mapper(this.value);
  }

  public equals(value: unknown): value is Value<T> {
    return (
      value instanceof Value &&
      Equality.equals(value.value, this.value) &&
      value.source.equals(this.source)
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield this.value;
  }

  public toString(): string {
    return `${this.value}`;
  }
}
