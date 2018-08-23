import { keys } from "@siteimprove/alfa-util";
import { expandBrowsers } from "./expand-browsers";
import { FeatureName, Features } from "./features";
import { getFeatureSupport } from "./get-feature-support";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, BrowserQuery, VersionSet } from "./types";

const features: Map<FeatureName, Map<BrowserName, VersionSet>> = new Map();

for (const name of keys(Features)) {
  const { supported } = getFeatureSupport(name);

  features.set(name, expandBrowsers(supported));
}

/**
 * Given the name of a feature, check if it is supported by the current browser
 * scope.
 */
export function isFeatureSupported(
  name: FeatureName,
  options: Readonly<{ browsers?: ReadonlyArray<BrowserQuery> }> = {}
): boolean {
  const browsers =
    options.browsers === undefined
      ? getSupportedBrowsers()
      : expandBrowsers(options.browsers);

  const feature = features.get(name)!;

  for (const [browser, versions] of browsers) {
    const support = feature.get(browser);

    if (support === undefined || support === false) {
      return false;
    }

    if (support === true || versions === true) {
      return true;
    }

    for (const version of versions) {
      if (!support.has(version)) {
        return false;
      }
    }
  }

  return true;
}
