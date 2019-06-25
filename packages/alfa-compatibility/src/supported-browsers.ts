import { Map, Set } from "@siteimprove/alfa-collection";
import { getDefaultBrowsers } from "./get-default-browsers";
import { BrowserName, Version } from "./types";

/**
 * The current scope of supported browsers.
 */
let supportedBrowsers: Map<
  BrowserName,
  Set<Version> | true
> = getDefaultBrowsers();

/**
 * Get the current scope of supported browsers.
 *
 * @internal
 */
export function getSupportedBrowsers(): Map<BrowserName, Set<Version> | true> {
  return supportedBrowsers;
}

/**
 * Set the current scope of supported browsers.
 *
 * @internal
 */
export function setSupportedBrowsers(
  browsers: Map<BrowserName, Set<Version> | true>
): Map<BrowserName, Set<Version> | true> {
  const previousBrowsers = supportedBrowsers;

  supportedBrowsers = browsers;

  return previousBrowsers;
}
