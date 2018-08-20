import { expandVersions } from "./expand-versions";
import { Browser, Comparator, Version } from "./types";

/**
 * @internal
 */
export function expandBrowsers(
  browsers: ReadonlyArray<[Browser, Version] | [Browser, Comparator, Version]>
): Map<Browser, Set<Version>> {
  const result: Map<Browser, Set<Version>> = new Map();

  for (const browser of browsers) {
    result.set(browser[0], expandVersions(browser));
  }

  return result;
}
