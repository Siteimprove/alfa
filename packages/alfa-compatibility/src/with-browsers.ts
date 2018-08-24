import { expandBrowsers } from "./expand-browsers";
import { setSupportedBrowsers } from "./supported-browsers";
import { BrowserName, BrowserQuery, VersionSet } from "./types";

export function withBrowsers<T>(
  browsers: ReadonlyArray<BrowserQuery>,
  callback: () => T
): T;

export function withBrowsers<T>(
  browsers: Map<BrowserName, VersionSet>,
  callback: () => T
): T;

export function withBrowsers<T>(
  browsers: ReadonlyArray<BrowserQuery> | Map<BrowserName, VersionSet>,
  callback: () => T
): T {
  const previousBrowsers = setSupportedBrowsers(
    browsers instanceof Map ? browsers : expandBrowsers(browsers)
  );

  try {
    return callback();
  } catch (err) {
    throw err;
  } finally {
    setSupportedBrowsers(previousBrowsers);
  }
}
