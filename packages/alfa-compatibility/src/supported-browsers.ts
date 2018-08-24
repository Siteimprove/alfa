import { getDefaultBrowsers } from "./get-default-browsers";
import { BrowserName, VersionSet } from "./types";

/**
 * The current scope of supported browsers.
 */
let supportedBrowsers = getDefaultBrowsers();

/**
 * Get the current scope of supported browsers.
 *
 * @internal
 */
export function getSupportedBrowsers(): Map<BrowserName, VersionSet> {
  return supportedBrowsers;
}

/**
 * Set the current scope of supported browsers.
 *
 * @internal
 */
export function setSupportedBrowsers(
  browsers: Map<BrowserName, VersionSet>
): Map<BrowserName, VersionSet> {
  const previousBrowsers = supportedBrowsers;

  supportedBrowsers = browsers;

  return previousBrowsers;
}
