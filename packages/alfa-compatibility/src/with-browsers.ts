import { expandBrowsers } from "./expand-browsers";
import { setSupportedBrowsers } from "./supported-browsers";
import { BrowserQuery } from "./types";

export function withBrowsers(
  browsers: ReadonlyArray<BrowserQuery>,
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
