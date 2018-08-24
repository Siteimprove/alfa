import { intersect } from "@siteimprove/alfa-util";
import { BrowserSpecific } from "./browser-specific";
import { isBrowserSpecific } from "./guards";
import { BrowserName, VersionSet } from "./types";
import { withBrowsers } from "./with-browsers";

export function map<T, U>(
  value: T | BrowserSpecific<T>,
  iteratee: (value: T) => U | BrowserSpecific<U>
): BrowserSpecific<U>;

export function map<T, U>(value: T, iteratee: (value: T) => U): U;

export function map<T, U>(
  value: T | BrowserSpecific<T>,
  iteratee: (value: T) => U | BrowserSpecific<U>
): U | BrowserSpecific<U> {
  if (isBrowserSpecific(value)) {
    const values: Array<{
      value: U;
      browsers: Map<BrowserName, VersionSet>;
    }> = [];

    for (const fst of value.values) {
      const value = withBrowsers(fst.browsers, () => iteratee(fst.value));

      if (isBrowserSpecific(value)) {
        for (const snd of value.values) {
          const browsers = new Map<BrowserName, VersionSet>();

          for (const [browser, thd] of fst.browsers) {
            const fth = snd.browsers.get(browser);

            if (fth === undefined) {
              continue;
            }

            if (thd === true && fth === true) {
              browsers.set(browser, true);
            } else if (thd === true) {
              browsers.set(browser, fth);
            } else if (fth === true) {
              browsers.set(browser, thd);
            } else {
              const common = intersect(thd, fth);

              if (common.size > 0) {
                browsers.set(browser, common);
              }
            }
          }

          if (browsers.size > 0) {
            values.push({ value: snd.value, browsers });
          }
        }
      } else {
        values.push({
          value,
          browsers: fst.browsers
        });
      }
    }

    return BrowserSpecific.of(values);
  }

  return iteratee(value);
}
