import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

import * as json from "@siteimprove/alfa-json";

import { None } from "./none";
import { Option } from "./option";

const { not, test } = Predicate;

export class Some<T> implements Option<T> {
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

  public map<U>(mapper: Mapper<T, U>): Option<U> {
    return new Some(mapper(this._value));
  }

  public flatMap<U>(mapper: Mapper<T, Option<U>>): Option<U> {
    return mapper(this._value);
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return reducer(accumulator, this._value);
  }

  public apply<U>(mapper: Option<Mapper<T, U>>): Option<U> {
    return mapper.map((mapper) => mapper(this._value));
  }

  public filter<U extends T>(refinement: Refinement<T, U>): Option<U>;

  public filter(predicate: Predicate<T>): Option<T>;

  public filter(predicate: Predicate<T>): Option<T> {
    return test(predicate, this._value) ? this : None;
  }

  public reject<U extends T>(
    refinement: Refinement<T, U>
  ): Option<Exclude<T, U>>;

  public reject(predicate: Predicate<T>): Option<T>;

  public reject(predicate: Predicate<T>): Option<T> {
    return this.filter(not(predicate));
  }

  public includes(value: T): boolean {
    return Equatable.equals(value, this._value);
  }

  public some(predicate: Predicate<T>): boolean {
    return test(predicate, this._value);
  }

  public none(predicate: Predicate<T>): boolean {
    return test(not(predicate), this._value);
  }

  public every(predicate: Predicate<T>): boolean {
    return test(predicate, this._value);
  }

  public and<U>(option: Option<U>): Option<U> {
    return option;
  }

  public andThen<U>(option: Mapper<T, Option<U>>): Option<U> {
    return option(this._value);
  }

  public or(): Option<T> {
    return this;
  }

  public orElse(): Option<T> {
    return this;
  }

  public get(): T {
    return this._value;
  }

  public getOr(): T {
    return this._value;
  }

  public getOrElse(): T {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return value instanceof Some && Equatable.equals(value._value, this._value);
  }

  public hash(hash: Hash): void {
    Hashable.hash(hash, this._value);
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield this._value;
  }

  public toArray(): [T] {
    return [this._value];
  }

  public toJSON(): Some.JSON {
    return {
      type: "some",
      value: Serializable.toJSON(this._value),
    };
  }

  public toString(): string {
    return `Some { ${this._value} }`;
  }
}

export namespace Some {
  export interface JSON {
    [key: string]: json.JSON;
    type: "some";
    value: json.JSON;
  }

  export function isSome<T>(value: unknown): value is Some<T> {
    return value instanceof Some;
  }
}
