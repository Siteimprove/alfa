import { expandVersions } from "./expand-versions";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserQuery } from "./types";

/**
 * Given a browser, optionally constrained by a version or a version range,
 * check if the browser is supported by the current browser scope.
 */
export function isBrowserSupported(browser: BrowserQuery): boolean {
  const browsers = getSupportedBrowsers();

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
