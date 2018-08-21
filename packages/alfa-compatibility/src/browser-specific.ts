import { combine } from "./combine";
import { expandBrowsers } from "./expand-browsers";
import { flatMap } from "./flat-map";
import { map } from "./map";
import { BrowserName, Comparator, Version } from "./types";

const { isArray } = Array;

export class BrowserSpecific<T> {
  /**
   * @internal
   */
  public readonly values: ReadonlyArray<{
    value: T;
    browsers: Map<BrowserName, Set<Version>>;
  }>;

  public constructor(
    values: ReadonlyArray<
      Readonly<{
        value: T;
        browsers: ReadonlyArray<
          | BrowserName
          | [BrowserName, Version]
          | [BrowserName, Comparator, Version]
        >;
      }>
    >
  );

  /**
   * @internal
   */
  public constructor(
    values: ReadonlyArray<
      Readonly<{
        value: T;
        browsers: Map<BrowserName, Set<Version>>;
      }>
    >
  );

  public constructor(
    values: ReadonlyArray<
      Readonly<{
        value: T;
        browsers:
          | ReadonlyArray<
              | BrowserName
              | [BrowserName, Version]
              | [BrowserName, Comparator, Version]
            >
          | Map<BrowserName, Set<Version>>;
      }>
    >
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
          expanded.push([browser, ">", "0"]);
        }
      }

      return {
        value,
        browsers: expandBrowsers(expanded)
      };
    });
  }

  public map<U>(iteratee: (value: T) => U): BrowserSpecific<U> {
    return map(this, iteratee);
  }

  public flatMap<U>(
    iteratee: (value: T) => U | BrowserSpecific<U>
  ): BrowserSpecific<U> {
    return flatMap(this, iteratee);
  }

  public combine<U, V>(
    other: U | BrowserSpecific<U>,
    iteratee: (value: T, other: U) => V | BrowserSpecific<V>
  ): BrowserSpecific<V> {
    return combine(this, other, iteratee);
  }
}
