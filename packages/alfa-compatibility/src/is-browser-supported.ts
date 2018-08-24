import { expandVersions } from "./expand-versions";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserQuery } from "./types";

/**
 * Given a browser, optionally constrained by a version or a version range,
 * check if the browser is supported by the current browser scope.
 */
export function isBrowserSupported(browser: BrowserQuery): boolean {
  const supported = getSupportedBrowsers();

  if (typeof browser === "string") {
    return supported.has(browser);
  }

  const support = supported.get(browser[0]);

  if (support === undefined) {
    return false;
  }

  if (support === true) {
    return true;
  }

  for (const version of expandVersions(browser)) {
    if (!support.has(version)) {
      return false;
    }
  }

  return true;
}
