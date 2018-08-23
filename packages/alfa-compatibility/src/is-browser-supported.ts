import { expandBrowsers } from "./expand-browsers";
import { expandVersions } from "./expand-versions";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserQuery } from "./types";

/**
 * Given a browser, optionally constrained
 */
export function isBrowserSupported(
  browser: BrowserQuery,
  options: Readonly<{ browsers?: ReadonlyArray<BrowserQuery> }> = {}
): boolean {
  const browsers =
    options.browsers === undefined
      ? getSupportedBrowsers()
      : expandBrowsers(options.browsers);

  if (typeof browser === "string") {
    return browsers.has(browser);
  }

  const supported = browsers.get(browser[0]);

  if (supported === undefined) {
    return false;
  }

  if (supported === true) {
    return true;
  }

  for (const version of expandVersions(browser)) {
    if (!supported.has(version)) {
      return false;
    }
  }

  return true;
}
