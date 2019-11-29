import { Equality } from "@siteimprove/alfa-equality";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { None } from "./none";
import { Option } from "./option";

const { test } = Predicate;

export class Some<T> implements Option<T> {
  public static of<T>(value: T): Some<T> {
    return new Some(value);
  }

  private readonly value: T;

  private constructor(value: T) {
    this.value = value;
  }

  public isSome(): this is Some<T> {
    return true;
  }

  public isNone(): this is None {
    return false;
  }

  public map<U>(mapper: Mapper<T, U>): Option<U> {
    return new Some(mapper(this.value));
  }

  public flatMap<U>(mapper: Mapper<T, Option<U>>): Option<U> {
    return mapper(this.value);
  }

  public apply<U>(mapper: Option<Mapper<T, U>>): Option<U> {
    return mapper.map(mapper => mapper(this.value));
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return reducer(accumulator, this.value);
  }

  public includes(value: T): boolean {
    return Equality.equals(value, this.value);
  }

  public some(predicate: Predicate<T>): boolean {
    return test(predicate, this.value);
  }

  public every(predicate: Predicate<T>): boolean {
    return test(predicate, this.value);
  }

  public filter<U extends T>(predicate: Predicate<T, U>): Option<U> {
    return test(predicate, this.value) ? new Some(this.value) : None;
  }

  public and<U>(option: Option<U>): Option<U> {
    return option;
  }

  public andThen<U>(option: Mapper<T, Option<U>>): Option<U> {
    return option(this.value);
  }

  public or(): Option<T> {
    return this;
  }

  public orElse(): Option<T> {
    return this;
  }

  public get(): T {
    return this.value;
  }

  public getOr(): T {
    return this.value;
  }

  public getOrElse(): T {
    return this.value;
  }

  public equals(value: unknown): value is Some<T> {
    return value instanceof Some && Equality.equals(value.value, this.value);
  }

  public hash(hash: Hash): void {
    Hashable.hash(this.value, hash);
  }

  public *[Symbol.iterator]() {
    yield this.value;
  }

  public toJSON(): { value: T } {
    return { value: this.value };
  }

  public toString() {
    return `Some { ${this.value} }`;
  }
}

export namespace Some {
  export function isSome<T>(value: unknown): value is Some<T> {
    return value instanceof Some;
  }
}
