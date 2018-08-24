import { expandBrowsers } from "./expand-browsers";
import { map } from "./map";
import { BrowserName, BrowserQuery, VersionSet } from "./types";

/**
 * @internal
 */
export type ValueList<T> = ReadonlyArray<
  Readonly<{ value: T; browsers: Map<BrowserName, VersionSet> }>
>;

export class BrowserSpecific<T> {
  public static of<T>(
    value: T,
    browsers: ReadonlyArray<BrowserQuery>
  ): BrowserSpecific<T>;

  /**
   * @internal
   */
  public static of<T>(
    value: T,
    browsers: Map<BrowserName, VersionSet>
  ): BrowserSpecific<T>;

  /**
   * @internal
   */
  public static of<T>(values: ValueList<T>): BrowserSpecific<T>;

  public static of<T>(
    values: T | ValueList<T>,
    browsers?: ReadonlyArray<BrowserQuery> | Map<BrowserName, VersionSet>
  ): BrowserSpecific<T> {
    if (browsers === undefined) {
      return new BrowserSpecific(values as ValueList<T>);
    }

    const value = values as T;

    if (browsers instanceof Map) {
      return new BrowserSpecific([{ value, browsers }]);
    }

    browsers = expandBrowsers(browsers);

    return new BrowserSpecific(
      browsers.size === 0 ? [] : [{ value, browsers }]
    );
  }

  /**
   * @internal
   */
  public readonly values: ValueList<T>;

  private constructor(values: ValueList<T>) {
    this.values = values;
  }

  public get(): T | BrowserSpecific<T> {
    return this.values.length === 1 ? this.values[0].value : this;
  }

  public map<U>(
    iteratee: (value: T) => U | BrowserSpecific<U>
  ): BrowserSpecific<U> {
    return map(this, iteratee);
  }

  public branch(
    value: T,
    browsers: ReadonlyArray<BrowserQuery>
  ): BrowserSpecific<T> {
    const expanded = expandBrowsers(browsers);

    if (expanded.size === 0) {
      return this;
    }

    return BrowserSpecific.of([
      ...this.values,
      {
        value,
        browsers: expanded
      }
    ]);
  }
}
