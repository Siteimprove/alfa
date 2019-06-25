import { List, Map, Set } from "@siteimprove/alfa-collection";
import { expandBrowsers } from "./expand-browsers";
import { isBrowserSpecific } from "./guards";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, BrowserQuery, Version } from "./types";
import { withBrowsers } from "./with-browsers";

export interface Value<T> {
  readonly value: T;
  readonly browsers: Map<BrowserName, Set<Version> | true>;
}

/**
 * This class is used for representing browser specific values upon which
 * computations can be performed. A browser specific value is not a single value
 * but rather a set of values that each apply to a different set of browsers.
 * Consumers of browser specific values need however not worry about whether a
 * browser specific value takes on two or a hundred concrete values; they simply
 * treat it as just a single value.
 */
export class BrowserSpecific<T> {
  public static of<T>(
    value: T,
    browsers: Iterable<BrowserQuery>
  ): BrowserSpecific<T> {
    const expanded = expandBrowsers(browsers);

    return new BrowserSpecific(
      List(expanded.size === 0 ? [] : [{ value, browsers: expanded }])
    );
  }

  private readonly values: List<Value<T>>;

  private constructor(values: List<Value<T>>) {
    this.values = values;
  }

  public get(): T | BrowserSpecific<T> {
    return this.values.size === 1 ? this.values.get(0)!.value : this;
  }

  public unwrap(): Iterable<Value<T>> {
    return this.values;
  }

  public map<U>(
    iteratee: (value: T) => U | BrowserSpecific<U>
  ): BrowserSpecific<U> {
    const values: List<Value<U>> = List().withMutations(values => {
      for (const source of this.values) {
        const value = withBrowsers(source.browsers, () =>
          iteratee(source.value)
        );

        if (isBrowserSpecific(value)) {
          for (const target of value.values) {
            const browsers = Map<
              BrowserName,
              Set<Version> | true
            >().withMutations(browsers => {
              for (const [browser, sourceVersions] of source.browsers) {
                const targetVersions = target.browsers.get(browser);

                // Case 0: The target value is undefined for all versions of the
                // current range of browser versions; move on.
                if (targetVersions === undefined) {
                  continue;
                }

                // Case 1: Both the target value and the source value are
                // defined for any version of the current range of browser
                // versions.
                if (targetVersions === true && sourceVersions === true) {
                  browsers.set(browser, true);
                }

                // Case 2: Only the source value is defined for any version of
                // the current range of browser versions; use the browser
                // versions for which the target value is defined.
                else if (sourceVersions === true) {
                  browsers.set(browser, targetVersions);
                }

                // Case 3: Only the target value is defined for any version of
                // the current range of browser versions; use the browser
                // versions for which the source value is defined.
                else if (targetVersions === true) {
                  browsers.set(browser, sourceVersions);
                }

                // Case 4: Both the target value and the source value are
                // defined for specific versions of the current range of browser
                // versions; use the intersection between these two sets of
                // versions.
                else {
                  const common = targetVersions.intersect(sourceVersions);

                  if (common.size > 0) {
                    browsers.set(browser, common);
                  }
                }
              }
            });

            if (browsers.size > 0) {
              values.push({ value: target.value, browsers });
            }
          }
        } else {
          values.push({
            value,
            browsers: source.browsers
          });
        }
      }
    });

    return new BrowserSpecific(values);
  }

  public branch(
    value: T,
    browsers: Iterable<BrowserQuery>
  ): BrowserSpecific<T> {
    const expanded = expandBrowsers(browsers);

    if (expanded.size === 0) {
      return this;
    }

    return new BrowserSpecific(
      this.values.push({
        value,
        browsers: expanded
      })
    );
  }
}

export namespace BrowserSpecific {
  export function map<T, U>(
    value: BrowserSpecific<T>,
    iteratee: (value: T) => U | BrowserSpecific<U>
  ): BrowserSpecific<U>;

  export function map<T, U>(
    value: T | BrowserSpecific<T>,
    iteratee: (value: T) => U | BrowserSpecific<U>
  ): U | BrowserSpecific<U>;

  export function map<T, U>(value: T, iteratee: (value: T) => U): U;

  export function map<T, U>(
    value: T | BrowserSpecific<T>,
    iteratee: (value: T) => U | BrowserSpecific<U>
  ): U | BrowserSpecific<U> {
    return isBrowserSpecific(value) ? value.map(iteratee) : iteratee(value);
  }

  export function unwrap<T>(value: T | BrowserSpecific<T>): Iterable<Value<T>> {
    return isBrowserSpecific(value)
      ? value.unwrap()
      : [
          {
            value: value,
            browsers: getSupportedBrowsers()
          }
        ];
  }
}

// Import of iterable helpers must happen after the `BrowserSpecific` class has
// been declared as all of the iterable helpers rely on this class.
import * as iterable from "./iterable";

export namespace BrowserSpecific {
  export const Iterable = iterable;
}
