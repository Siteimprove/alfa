import { Browsers } from "./browsers";
import { combine } from "./combine";
import { expandBrowsers } from "./expand-browsers";
import { map } from "./map";
import { BrowserName, Comparator, Version } from "./types";

const { isArray } = Array;
const { keys } = Object;

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
