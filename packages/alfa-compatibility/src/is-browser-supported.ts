/// <reference path="../types/browserslist.d.ts" />

import browserslist = require("browserslist");

const supportedBrowsers = new Set(browserslist());

const whitespace = /\s+/;

/**
 * Given the name of a browser, or a browserslist query, check if the browser,
 * or the browsers that the browserslist query resolves to, are supported by the
 * current browser scope.
 *
 * @see http://browserl.ist/
 */
export function isBrowserSupported(
  browser: string,
  options: Readonly<{ browsers?: string | Array<string> }> = {}
): boolean {
  browser = browser.toLowerCase();

  const browsers =
    options.browsers === undefined
      ? supportedBrowsers
      : new Set(browserslist(options.browsers));

  switch (browser) {
    case "chrome":
    case "edge":
    case "firefox":
    case "ie":
    case "opera":
    case "safari":
      for (const found of browsers) {
        const [name] = found.split(whitespace);

        if (name === browser) {
          return true;
        }
      }

      return false;
  }

  return browserslist(browser).every(browser => browsers.has(browser));
}
