import { expandBrowsers } from "./expand-browsers";
import { filter } from "./filter";
import { find } from "./find";
import { map } from "./map";
import { reduce } from "./reduce";
import { BrowserName, BrowserQuery, VersionSet } from "./types";
import { unwrap } from "./unwrap";

/**
 * @internal
 */
export type ValueList<T> = ReadonlyArray<
  Readonly<{ value: T; browsers: Map<BrowserName, VersionSet> }>
>;

/**
 * This class is used for representing browser specific values upon which
 * computations can be performed. A browser specific value is not a single value
 * but rather a set of values that each apply to a different set of browsers.
 * Consumers of browser specific values need however not worry about whether a
 * browser specific value takes on two or a hundred concrete values; they simply
 * treat it as just a single value.
 */
export class BrowserSpecific<T> {
  public static filter = filter;
  public static find = find;
  public static map = map;
  public static reduce = reduce;
  public static unwrap = unwrap;

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
