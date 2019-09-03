import { Set } from "@siteimprove/alfa-collection";
import { Browsers } from "./browsers";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, BrowserQuery, Version } from "./types";

const { keys } = Object;

/**
 * @internal
 */
export function expandVersions(
  browser: Exclude<BrowserQuery, BrowserName>,
  options: expandVersions.Options = {}
): Set<Version> {
  const supported = getSupportedBrowsers();
  const name = browser[0];

  const support = supported.get(name);

  if (support === undefined) {
    return Set();
  }

  return Set<Version>().withMutations(result => {
    const { releases } = Browsers[name];

    if (browser.length === 2) {
      const version = browser[1];

      if (version in releases === false) {
        throw new Error(`Invalid browser query: [${browser.join(", ")}]`);
      }

      if (
        options.unsupported === true ||
        support === true ||
        support.has(version)
      ) {
        result.add(version);
      }
    } else {
      let lower = 0;
      let upper = Infinity;

      switch (browser[1]) {
        case "<": {
          const version = browser[2];
          if (version in releases) {
            upper = releases[version].date - 1;
          }
          break;
        }

        case ">": {
          const version = browser[2];
          if (version in releases) {
            lower = releases[version].date + 1;
          }
          break;
        }

        case "<=": {
          const version = browser[2];
          if (version in releases) {
            upper = releases[version].date;
          }
          break;
        }

        case ">=": {
          const version = browser[2];
          if (version in releases) {
            lower = releases[version].date;
          }
          break;
        }

        default: {
          const from = browser[1];
          const to = browser[2];

          if (from in releases && to in releases) {
            lower = releases[from].date;
            upper = releases[to].date;
          }
        }
      }

      if (lower === 0 && upper === Infinity) {
        throw new Error(`Invalid browser query: [${browser.join(", ")}]`);
      }

      for (const version of keys(releases)) {
        const { date } = releases[version];

        if (date >= lower && date <= upper) {
          if (
            options.unsupported === true ||
            support === true ||
            support.has(version)
          ) {
            result.add(version);
          }
        }
      }
    }
  });
}

/**
 * @internal
 */
export namespace expandVersions {
  export interface Options {
    readonly unsupported?: boolean;
  }
}
