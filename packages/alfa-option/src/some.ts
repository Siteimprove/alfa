import { Callback } from "@siteimprove/alfa-callback";
import { Comparable, Comparison, Comparer } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

import * as json from "@siteimprove/alfa-json";

import { Option } from "./option.js";
import { None } from "./none.js";

const { not, test } = Predicate;
const { compareComparable } = Comparable;

/**
 * @public
 */
export class Some<T, O extends Serializable.Options = Serializable.Options>
  implements Option<T, O>
{
  public static of<T>(value: T): Some<T> {
    return new Some(value);
  }

  private readonly _value: T;

  private constructor(value: T) {
    this._value = value;
  }

  public isSome(): this is Some<T> {
    return true;
  }

  public isNone(): this is None {
    return false;
  }

  public map<U>(mapper: Mapper<T, U>): Some<U> {
    return new Some(mapper(this._value));
  }

  public forEach(mapper: Mapper<T, void>): void {
    mapper(this._value);
  }

  public apply<U>(mapper: Option<Mapper<T, U>>): Option<U> {
    return mapper.map((mapper) => mapper(this._value));
  }

  public flatMap<U>(mapper: Mapper<T, Option<U>>): Option<U> {
    return mapper(this._value);
  }

  public flatten<T>(this: Some<Option<T>>): Option<T> {
    return this._value;
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return reducer(accumulator, this._value);
  }

  public filter<U extends T>(refinement: Refinement<T, U>): Option<U>;

  public filter(predicate: Predicate<T>): Option<T>;

  public filter(predicate: Predicate<T>): Option<T> {
    return test(predicate, this._value) ? this : None;
  }

  public reject<U extends T>(
    refinement: Refinement<T, U>,
  ): Option<Exclude<T, U>>;

  public reject(predicate: Predicate<T>): Option<T>;

  public reject(predicate: Predicate<T>): Option<T> {
    return this.filter(not(predicate));
  }

  public includes(value: T): boolean {
    return Equatable.equals(value, this._value);
  }

  public some<U extends T>(refinement: Refinement<T, U>): this is Some<U>;

  public some(predicate: Predicate<T>): boolean;

  public some(predicate: Predicate<T>): boolean {
    return test(predicate, this._value);
  }

  public none<U extends T>(
    refinement: Refinement<T, U>,
  ): this is Some<Exclude<T, U>>;

  public none(predicate: Predicate<T>): boolean;

  public none(predicate: Predicate<T>): boolean {
    return test(not(predicate), this._value);
  }

  public every<U extends T>(refinement: Refinement<T, U>): this is Some<U>;

  public every(predicate: Predicate<T>): boolean;

  public every(predicate: Predicate<T>): boolean {
    return test(predicate, this._value);
  }

  public and<U>(option: Option<U>): Option<U> {
    return option;
  }

  public andThen<U>(option: Mapper<T, Option<U>>): Option<U> {
    return option(this._value);
  }

  public or(): Some<T> {
    return this;
  }

  public orElse(): Some<T> {
    return this;
  }

  public get(): T {
    return this._value;
  }

  /**
   * @internal
   */
  public getUnsafe(): T {
    return this._value;
  }

  public getOr(): T {
    return this._value;
  }

  public getOrElse(): T {
    return this._value;
  }

  public tee(callback: Callback<T>): this {
    callback(this._value);
    return this;
  }

  public compare<T>(
    this: Option<Comparable<T>>,
    option: Option<T>,
  ): Comparison {
    return this.compareWith(option, compareComparable);
  }

  public compareWith<U = T>(
    option: Option<U>,
    comparer: Comparer<T, U>,
  ): Comparison {
    return option.isSome()
      ? comparer(this._value, option._value)
      : Comparison.Greater;
  }

  public equals(value: unknown): value is this {
    return value instanceof Some && Equatable.equals(value._value, this._value);
  }

  public hash(hash: Hash): void {
    hash.writeBoolean(true).writeUnknown(this._value);
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield this._value;
  }

  public toArray(): [T] {
    return [this._value];
  }

  public toJSON(options?: O): Some.JSON<T> {
    return {
      type: "some",
      value: Serializable.toJSON(this._value, options),
    };
  }

  public toString(): string {
    return `Some { ${this._value} }`;
  }
}

/**
 * @public
 */
export namespace Some {
  export interface JSON<T> {
    [key: string]: json.JSON;
    type: "some";
    value: Serializable.ToJSON<T>;
  }

  export function isSome<T>(value: Iterable<T>): value is Some<T>;

  export function isSome<T>(value: unknown): value is Some<T>;

  export function isSome<T>(value: unknown): value is Some<T> {
    return value instanceof Some;
  }
}
