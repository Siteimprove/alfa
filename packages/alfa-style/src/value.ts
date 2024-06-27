import type { Applicative } from "@siteimprove/alfa-applicative";
import type { Resolvable, Value as CSSValue } from "@siteimprove/alfa-css";
import { Declaration } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Monad } from "@siteimprove/alfa-monad";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export class Value<T = unknown>
  implements
    Functor<T>,
    Applicative<T>,
    Monad<T>,
    Iterable<T>,
    Equatable,
    Serializable<Value.JSON<T>>
{
  public static of<T>(value: T, source: Option<Declaration> = None): Value<T> {
    return new Value(value, source);
  }

  private readonly _value: T;
  private readonly _source: Option<Declaration>;

  private constructor(value: T, source: Option<Declaration>) {
    this._value = value;
    this._source = source;
  }

  public get value(): T {
    return this._value;
  }

  public get source(): Option<Declaration> {
    return this._source;
  }

  public map<U>(mapper: Mapper<T, U, [source: Option<Declaration>]>): Value<U> {
    return new Value(mapper(this._value, this._source), this._source);
  }

  public resolve<T extends CSSValue>(
    this: Value<T>,
    resolver?: Resolvable.Resolver<T>,
  ): Value<Resolvable.Resolved<T>> {
    return new Value(
      this._value.resolve(resolver) as Resolvable.Resolved<T>,
      this._source,
    );
  }

  public apply<U>(mapper: Value<Mapper<T, U>>): Value<U> {
    return mapper.map((mapper) => mapper(this._value));
  }

  public flatMap<U>(
    mapper: Mapper<T, Value<U>, [source: Option<Declaration>]>,
  ): Value<U> {
    return mapper(this._value, this._source);
  }

  public flatten<T>(this: Value<Value<T>>): Value<T> {
    return this._value;
  }

  public includes(value: T): boolean {
    return Equatable.equals(this._value, value);
  }

  public some(predicate: Predicate<T, [source: Option<Declaration>]>): boolean {
    return predicate(this._value, this._source);
  }

  public none(predicate: Predicate<T, [source: Option<Declaration>]>): boolean {
    return !predicate(this._value, this._source);
  }

  public equals(value: Value): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): value is this {
    return (
      value instanceof Value &&
      Equatable.equals(value._value, this._value) &&
      value._source.equals(this._source)
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield this._value;
  }

  public toJSON(): Value.JSON<T> {
    return {
      value: Serializable.toJSON(this._value),
      source: this._source.map((source) => source.toJSON()).getOr(null),
    };
  }

  public toString(): string {
    return `${this._value}`;
  }
}

/**
 * @public
 */
export namespace Value {
  export interface JSON<T = unknown> {
    [key: string]: json.JSON;
    value: Serializable.ToJSON<T>;
    source: Declaration.JSON | null;
  }
}
