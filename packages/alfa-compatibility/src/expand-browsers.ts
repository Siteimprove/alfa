import { expandVersions } from "./expand-versions";
import { BrowserName, Comparator, Version } from "./types";

/**
 * @internal
 */
export function expandBrowsers(
  browsers: ReadonlyArray<
    [BrowserName, Version] | [BrowserName, Comparator, Version]
  >
): Map<BrowserName, Set<Version>> {
  const result: Map<BrowserName, Set<Version>> = new Map();

  for (const browser of browsers) {
    let versions = result.get(browser[0]);

    if (versions === undefined) {
      versions = new Set();
      result.set(browser[0], versions);
    }

    for (const version of expandVersions(browser)) {
      versions.add(version);
    }
  }

  return result;
}
