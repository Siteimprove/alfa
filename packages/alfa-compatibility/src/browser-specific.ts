import { branch } from "./branch";
import { expandBrowsers } from "./expand-browsers";
import { map } from "./map";
import { merge } from "./merge";
import { BrowserName, BrowserQuery, VersionSet } from "./types";

/**
 * @internal
 */
export type BrowserList =
  | ReadonlyArray<BrowserQuery>
  | Map<BrowserName, VersionSet>;

/**
 * @internal
 */
export type ValueList<T> = ReadonlyArray<
  Readonly<{ value: T; browsers: BrowserList }>
>;

export class BrowserSpecific<T> {
  public static of<T>(
    value: T,
    browsers: ReadonlyArray<BrowserQuery>
  ): BrowserSpecific<T>;

  /**
   * @internal
   */
  public static of<T>(value: T, browsers: BrowserList): BrowserSpecific<T>;

  /**
   * @internal
   */
  public static of<T>(values: ValueList<T>): BrowserSpecific<T>;

  public static of<T>(
    values: T | ValueList<T>,
    browsers?: BrowserList
  ): BrowserSpecific<T> {
    return new BrowserSpecific(
      browsers === undefined
        ? (values as ValueList<T>)
        : [{ value: values as T, browsers }]
    );
  }

  /**
   * @internal
   */
  public readonly values: ReadonlyArray<{
    value: T;
    browsers: Map<BrowserName, VersionSet>;
  }>;

  private constructor(
    values: ReadonlyArray<Readonly<{ value: T; browsers: BrowserList }>>
  ) {
    this.values = values.map(({ value, browsers }) => {
      if (browsers instanceof Map) {
        return { value, browsers };
      }

      return {
        value,
        browsers: expandBrowsers(browsers)
      };
    });
  }

  public value(): T | BrowserSpecific<T> {
    return this.values.length === 1 ? this.values[0].value : this;
  }

  public map<U>(
    iteratee: (value: T) => U | BrowserSpecific<U>
  ): BrowserSpecific<U> {
    return map(this, iteratee);
  }

  public merge<U, V>(
    other: U | BrowserSpecific<U>,
    iteratee: (value: T, other: U) => V | BrowserSpecific<V>
  ): BrowserSpecific<V> {
    return merge(this, other, iteratee);
  }

  public branch(
    value: T,
    browsers: ReadonlyArray<BrowserQuery>
  ): BrowserSpecific<T> {
    return branch(this, value, browsers);
  }
}
