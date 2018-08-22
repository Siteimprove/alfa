import { Browsers } from "./browsers";
import { combine } from "./combine";
import { expandBrowsers } from "./expand-browsers";
import { map } from "./map";
import { BrowserName, BrowserQuery, Comparator, Version } from "./types";

const { isArray } = Array;
const { keys } = Object;

/**
 * @internal
 */
export type BrowserList =
  | ReadonlyArray<BrowserQuery>
  | Map<BrowserName, Set<Version>>;

/**
 * @internal
 */
export type ValueList<T> = ReadonlyArray<
  Readonly<{ value: T; browsers: BrowserList }>
>;

export class BrowserSpecific<T> {
  /**
   * @internal
   */
  public static of<T>(value: T, browsers: BrowserList): BrowserSpecific<T>;

  /**
   * @internal
   */
  public static of<T>(values: ValueList<T>): BrowserSpecific<T>;

  /**
   * @internal
   */
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
    browsers: Map<BrowserName, Set<Version>>;
  }>;

  private constructor(
    values: ReadonlyArray<Readonly<{ value: T; browsers: BrowserList }>>
  ) {
    this.values = values.map(({ value, browsers }) => {
      if (browsers instanceof Map) {
        return { value, browsers };
      }

      const expanded: Array<
        [BrowserName, Version] | [BrowserName, Comparator, Version]
      > = [];

      for (const browser of browsers) {
        if (isArray(browser)) {
          expanded.push(browser);
        } else {
          const [first] = keys(Browsers[browser].releases);
          expanded.push([browser, ">=", first]);
        }
      }

      return {
        value,
        browsers: expandBrowsers(expanded)
      };
    });
  }

  public map<U>(
    iteratee: (value: T) => U | BrowserSpecific<U>
  ): BrowserSpecific<U> {
    return map(this, iteratee);
  }

  public combine<U, V>(
    other: U | BrowserSpecific<U>,
    iteratee: (value: T, other: U) => V | BrowserSpecific<V>
  ): BrowserSpecific<V> {
    return combine(this, other, iteratee);
  }
}
