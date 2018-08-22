import { expandVersions } from "./expand-versions";
import { BrowserName, BrowserQuery, Version } from "./types";

/**
 * @internal
 */
export function expandBrowsers(
  browsers: ReadonlyArray<BrowserQuery>
): Map<BrowserName, Set<Version>> {
  const result: Map<BrowserName, Set<Version>> = new Map();

  for (const browser of browsers) {
    const name = typeof browser === "string" ? browser : browser[0];

    let versions = result.get(name);

    if (versions === undefined) {
      versions = new Set();
      result.set(name, versions);
    }

    for (const version of expandVersions(browser)) {
      versions.add(version);
    }
  }

  return result;
}
