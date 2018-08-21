import { resolveQuery } from "./resolve-query";
import { BrowserName, Comparator, Version } from "./types";

/**
 * @internal
 */
export function expandVersions(
  browser: [BrowserName, Version] | [BrowserName, Comparator, Version]
): Set<Version> {
  if (browser.length === 2) {
    return new Set([browser[1]]);
  }

  const query = browser.join(" ");

  const result = resolveQuery(query);

  return result.get(browser[0])!;
}
