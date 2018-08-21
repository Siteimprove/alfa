import { expandBrowsers } from "./expand-browsers";
import { setSupportedBrowsers } from "./supported-browsers";
import { BrowserName, Comparator, Version } from "./types";

export function withBrowsers(
  browsers: ReadonlyArray<
    [BrowserName, Version] | [BrowserName, Comparator, Version]
  >,
  callback: () => void
): void {
  const previousBrowsers = setSupportedBrowsers(expandBrowsers(browsers));

  try {
    callback();
  } catch (err) {
    throw err;
  } finally {
    setSupportedBrowsers(previousBrowsers);
  }
}
