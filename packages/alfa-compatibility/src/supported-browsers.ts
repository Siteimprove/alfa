import { getDefaultBrowsers } from "./get-default-browsers";
import { BrowserName, Version } from "./types";

/**
 * The current scope of supported browsers.
 */
let supportedBrowsers = getDefaultBrowsers();

/**
 * Get the current scope of supported browsers.
 *
 * @internal
 */
export function getSupportedBrowsers(): Map<BrowserName, Set<Version>> {
  return supportedBrowsers;
}

/**
 * Set the current scope of supported browsers.
 *
 * @internal
 */
export function setSupportedBrowsers(
  browsers: Map<BrowserName, Set<Version>>
): Map<BrowserName, Set<Version>> {
  const previousBrowsers = supportedBrowsers;

  supportedBrowsers = browsers;

  return previousBrowsers;
}
