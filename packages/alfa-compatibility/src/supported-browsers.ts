/// <reference path="../types/browserslist.d.ts" />

import browserslist = require("browserslist");

/**
 * The current scope of supported browsers.
 */
let supportedBrowsers = browserslist();

/**
 * Get the current scope of supported browsers.
 */
export function getSupportedBrowsers(): Array<string> {
  return supportedBrowsers;
}

/**
 * Set the current scope of supported browsers. An optional scope can be
 * provided, which is a function that will be invoked after setting the given
 * browser scope and resetting to the previous browser scope when done.
 */
export function setSupportedBrowsers(
  browsers: string | Array<string>,
  scope?: () => void
): void {
  if (scope === undefined) {
    supportedBrowsers = browserslist(browsers);
  } else {
    const previousBrowsers = supportedBrowsers;
    supportedBrowsers = browserslist(browsers);
    scope();
    supportedBrowsers = previousBrowsers;
  }
}
