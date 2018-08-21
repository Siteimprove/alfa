import { expandBrowsers } from "./expand-browsers";
import { expandVersions } from "./expand-versions";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, Comparator, Version } from "./types";

const { isArray } = Array;

/**
 * Given a browser, optionally constrained
 */
export function isBrowserSupported(
  browser:
    | BrowserName
    | [BrowserName, Version]
    | [BrowserName, Comparator, Version],
  options: Readonly<{
    browsers?: ReadonlyArray<
      [BrowserName, Version] | [BrowserName, Comparator, Version]
    >;
  }> = {}
): boolean {
  const browsers =
    options.browsers === undefined
      ? getSupportedBrowsers()
      : expandBrowsers(options.browsers);

  if (!isArray(browser)) {
    return browsers.has(browser);
  }

  const supported = browsers.get(browser[0]);

  if (supported === undefined) {
    return false;
  }

  for (const version of expandVersions(browser)) {
    if (!supported.has(version)) {
      return false;
    }
  }

  return true;
}
