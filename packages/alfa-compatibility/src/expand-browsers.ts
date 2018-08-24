import { expandVersions } from "./expand-versions";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, BrowserQuery, VersionSet } from "./types";

/**
 * @internal
 */
export function expandBrowsers(
  browsers: ReadonlyArray<BrowserQuery>
): Map<BrowserName, VersionSet> {
  const supported = getSupportedBrowsers();
  const result = new Map<BrowserName, VersionSet>();

  for (const browser of browsers) {
    if (typeof browser === "string") {
      const support = supported.get(browser);

      if (support !== undefined) {
        result.set(browser, true);
      }
    } else {
      const name = browser[0];

      let versions = result.get(name);

      if (versions === undefined || versions === true) {
        versions = new Set();
      }

      for (const version of expandVersions(browser)) {
        versions.add(version);
      }

      if (versions.size > 0) {
        result.set(name, versions);
      }
    }
  }

  return result;
}
