import { combine } from "./combine";
import { expandVersions } from "./expand-versions";
import { map } from "./map";
import { Browser, Comparator, Version } from "./types";

const { isArray } = Array;

export class BrowserSpecific<T> {
  /**
   * @internal
   */
  public readonly values: ReadonlyArray<{
    value: T;
    browsers: Map<Browser, Set<Version>>;
  }>;

  public constructor(
    values: ReadonlyArray<
      Readonly<{
        value: T;
        browsers: ReadonlyArray<
          Browser | [Browser, Version] | [Browser, Comparator, Version]
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
        browsers: Map<Browser, Set<Version>>;
      }>
    >
  );

  public constructor(
    values: ReadonlyArray<
      Readonly<{
        value: T;
        browsers:
          | ReadonlyArray<
              Browser | [Browser, Version] | [Browser, Comparator, Version]
            >
          | Map<Browser, Set<Version>>;
      }>
    >
  ) {
    this.values = values.map(({ value, browsers }) => {
      let expanded: Map<Browser, Set<Version>>;

      if (browsers instanceof Map) {
        expanded = browsers;
      } else {
        expanded = new Map();

        for (const browser of browsers) {
          if (isArray(browser)) {
            expanded.set(browser[0], expandVersions(browser));
          } else {
            expanded.set(browser, expandVersions([browser, ">", "0"]));
          }
        }
      }

      return {
        value,
        browsers: expanded
      };
    });
  }

  public map<U>(iteratee: (value: T) => U): BrowserSpecific<U> {
    return map(this, iteratee);
  }

  public combine<U, V>(
    other: U | BrowserSpecific<U>,
    iteratee: (value: T, other: U) => V
  ): BrowserSpecific<V> {
    return combine(this, other, iteratee);
  }
}
