import { BrowserSpecific } from "./browser-specific";
import { isBrowserSpecific } from "./guards";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, Version, VersionSet } from "./types";

export interface Unwrapped<T> {
  readonly value: T;
  readonly browsers: UnwrappedBrowsers;
}

export type UnwrappedBrowsers = {
  readonly [browserName in BrowserName]?: true | ReadonlyArray<Version>
};

export function unwrap<T>(
  value: T | BrowserSpecific<T>
): ReadonlyArray<Unwrapped<T>> {
  if (isBrowserSpecific(value)) {
    return value.values.map(value => {
      return {
        value: value.value,
        browsers: unwrapBrowsers(value.browsers)
      };
    });
  }

  return [
    {
      value,
      browsers: unwrapBrowsers(getSupportedBrowsers())
    }
  ];
}

function unwrapBrowsers(browsers: Map<BrowserName, VersionSet>) {
  const supportedBrowsers = getSupportedBrowsers();

  const unwrapped: { [key: string]: true | Array<string> } = {};

  for (const [browser, versions] of browsers) {
    if (typeof versions === "boolean") {
      const supportedVersions = supportedBrowsers.get(browser);

      if (
        supportedVersions === undefined ||
        typeof supportedVersions === "boolean"
      ) {
        unwrapped[browser] = versions;
      } else {
        unwrapped[browser] = [...supportedVersions];
      }
    } else {
      unwrapped[browser] = [...versions];
    }
  }

  return unwrapped;
}
