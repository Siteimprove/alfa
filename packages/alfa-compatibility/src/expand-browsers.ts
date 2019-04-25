import { Map, Set } from "@siteimprove/alfa-collection";
import { expandVersions } from "./expand-versions";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, BrowserQuery, Version } from "./types";

/**
 * @internal
 */
export function expandBrowsers(
  browsers: Iterable<BrowserQuery>,
  options: { readonly unsupported?: boolean } = {}
): Map<BrowserName, Set<Version> | true> {
  const supported = getSupportedBrowsers();

  return Map<BrowserName, Set<Version> | true>().withMutations(result => {
    for (const browser of browsers) {
      if (typeof browser === "string") {
        if (options.unsupported === true) {
          result.set(browser, true);
        }

        if (supported.has(browser)) {
          result.set(browser, supported.get(browser)!);
        }
      } else {
        const name = browser[0];

        let versions = result.get(name);

        if (versions === undefined || versions === true) {
          versions = Set();
        }

        for (const version of expandVersions(browser, options)) {
          versions = versions.add(version);
        }

        if (versions.size > 0) {
          result.set(name, versions);
        }
      }
    }
  });
}
