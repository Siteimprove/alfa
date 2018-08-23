import { expandVersions } from "./expand-versions";
import { BrowserName, BrowserQuery, VersionSet } from "./types";

/**
 * @internal
 */
export function expandBrowsers(
  browsers: ReadonlyArray<BrowserQuery>
): Map<BrowserName, VersionSet> {
  const result = new Map<BrowserName, VersionSet>();

  for (const browser of browsers) {
    if (typeof browser === "string") {
      result.set(browser, true);
    } else {
      const name = browser[0];

      let versions = result.get(name);

      if (versions === undefined || versions === true) {
        versions = new Set();
        result.set(name, versions);
      }

      for (const version of expandVersions(browser)) {
        versions.add(version);
      }
    }
  }

  return result;
}
