import { expandBrowsers } from "./expand-browsers";
import { BrowserName, Comparator, Version } from "./types";
import { getDefaultBrowsers } from "./get-default-browsers";

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
 * Set the current scope of supported browsers. An optional scope can be
 * provided, which is a function that will be invoked after setting the given
 * browser scope and resetting to the previous browser scope when the function
 * returns.
 */
export function setSupportedBrowsers(
  browsers: ReadonlyArray<
    [BrowserName, Version] | [BrowserName, Comparator, Version]
  >,
  scope?: () => void
): void {
  const previousBrowsers = supportedBrowsers;

  supportedBrowsers = expandBrowsers(browsers);

  if (scope !== undefined) {
    scope();
    supportedBrowsers = previousBrowsers;
  }
}
