import { Set } from "@siteimprove/alfa-collection";
import { keys } from "@siteimprove/alfa-util";
import { expandBrowsers } from "./expand-browsers";
import { FeatureName, Features } from "./features";
import { getFeatureSupport } from "./get-feature-support";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, Version } from "./types";

const features: Map<
  FeatureName,
  Map<BrowserName, Set<Version> | true>
> = new Map();

for (const name of keys(Features)) {
  features.set(
    name,
    new Map(
      expandBrowsers(getFeatureSupport(name).supported, {
        unsupported: true
      })
    )
  );
}

/**
 * Given the name of a feature, check if it is supported by the current browser
 * scope.
 */
export function isFeatureSupported(name: FeatureName): boolean {
  const feature = features.get(name)!;

  for (const [browser, versions] of getSupportedBrowsers()) {
    const support = feature.get(browser);

    if (support === undefined) {
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
