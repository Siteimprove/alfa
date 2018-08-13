/// <reference path="../types/browserslist.d.ts" />

import browserslist = require("browserslist");

const supportedBrowsers = new Set(browserslist());

/**
 * Given a browser query, check if the browsers that the query resolves to are
 * supported by the current browser scope.
 *
 * @see http://browserl.ist/
 */
export function isBrowserSupported(
  browser: string,
  options: Readonly<{ browsers?: string | Array<string> }> = {}
): boolean {
  const browsers =
    options.browsers === undefined
      ? supportedBrowsers
      : new Set(browserslist(options.browsers));

  return browserslist(browser).every(browser => browsers.has(browser));
}
