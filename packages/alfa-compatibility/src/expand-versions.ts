import { resolveQuery } from "./resolve-query";
import { Browser, Comparator, Version } from "./types";

/**
 * @internal
 */
export function expandVersions(
  browser: [Browser, Version] | [Browser, Comparator, Version]
): Set<Version> {
  const query = browser.join(" ");

  const result = resolveQuery(query);

  return result.get(browser[0])!;
}
