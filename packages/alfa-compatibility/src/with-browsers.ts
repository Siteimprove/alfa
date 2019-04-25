import { Map, Set } from "@siteimprove/alfa-collection";
import { expandBrowsers } from "./expand-browsers";
import { setSupportedBrowsers } from "./supported-browsers";
import { BrowserName, BrowserQuery, Version } from "./types";

export function withBrowsers<T>(
  browsers: Iterable<BrowserQuery>,
  callback: () => T
): T;

/**
 * @internal
 */
export function withBrowsers<T>(
  browsers: Map<BrowserName, Set<Version> | true>,
  callback: () => T
): T;

export function withBrowsers<T>(
  browsers: Iterable<BrowserQuery> | Map<BrowserName, Set<Version> | true>,
  callback: () => T
): T {
  const previousBrowsers = setSupportedBrowsers(
    Map.isMap(browsers)
      ? browsers
      : expandBrowsers(browsers, { unsupported: true })
  );

  try {
    return callback();
  } catch (err) {
    throw err;
  } finally {
    setSupportedBrowsers(previousBrowsers);
  }
}
