import { Mapper } from "@siteimprove/alfa-mapper";
import { Reducer } from "@siteimprove/alfa-reducer";
import { None } from "./none";
import { Option } from "./option";

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
    return Some.of(mapper(this.value));
  }

  public flatten<U>(): Option.Flattened<T, U>;

  public flatten<U>(): this | Option<U> {
    return Option.isOption<U>(this.value) ? this.value : this;
  }

  public flatMap<U>(mapper: Mapper<T, Option<U>>): Option<U> {
    return mapper(this.value);
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return reducer(accumulator, this.value);
  }

  public and<U>(option: Option<U>): Option<U> {
    return option;
  }

  public andThen<U>(option: Mapper<T, Option<U>>): Option<U> {
    return option(this.value);
  }

  public or(): this {
    return this;
  }

  public orElse(): this {
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

  public toJSON(): { value: T } {
    return { value: this.value };
  }

  public toString() {
    return `Some { ${this.value} }`;
  }
}
