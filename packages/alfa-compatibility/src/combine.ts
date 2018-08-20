import { intersect } from "@siteimprove/alfa-util";
import { BrowserSpecific } from "./browser-specific";
import { isBrowserSpecific } from "./is-browser-specific";
import { map } from "./map";
import { Browser, Version } from "./types";

export function combine<T, U, V>(
  value: T | BrowserSpecific<T>,
  other: BrowserSpecific<U>,
  iteratee: (value: T, other: U) => V
): BrowserSpecific<V>;

export function combine<T, U, V>(
  value: BrowserSpecific<T>,
  other: U | BrowserSpecific<U>,
  iteratee: (value: T, other: U) => V
): BrowserSpecific<V>;

export function combine<T, U, V>(
  value: T,
  other: U,
  iteratee: (value: T, other: U) => V
): V;

export function combine<T, U, V>(
  value: T | BrowserSpecific<T>,
  other: U | BrowserSpecific<U>,
  iteratee: (value: T, other: U) => V
): V | BrowserSpecific<V> {
  if (isBrowserSpecific(value)) {
    if (isBrowserSpecific(other)) {
      const values: Array<{
        value: V;
        browsers: Map<Browser, Set<Version>>;
      }> = [];

      for (const fst of value.values) {
        for (const snd of other.values) {
          const browsers: Map<Browser, Set<Version>> = new Map();

          for (const [browser, thd] of fst.browsers) {
            const fth = snd.browsers.get(browser);

            if (fth === undefined) {
              continue;
            }

            const common = intersect(thd, fth);

            if (common.size > 0) {
              browsers.set(browser, common);
            }
          }

          if (browsers.size > 0) {
            values.push({ value: iteratee(fst.value, snd.value), browsers });
          }
        }
      }

      return new BrowserSpecific(values);
    }

    return map(value, value => iteratee(value, other));
  }

  if (isBrowserSpecific(other)) {
    return map(other, other => iteratee(value, other));
  }

  return iteratee(value, other);
}
