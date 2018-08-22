import { keys } from "@siteimprove/alfa-util";
import { expandBrowsers } from "./expand-browsers";
import { expandVersions } from "./expand-versions";
import { FeatureName, Features } from "./features";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, BrowserQuery, Version } from "./types";

const features: Map<
  FeatureName,
  Map<BrowserName, boolean | Set<Version>>
> = new Map();

for (const name of keys(Features)) {
  const feature = Features[name];

  const support: Map<BrowserName, boolean | Set<Version>> = new Map();

  features.set(name, support);

  for (const browser of keys(feature.support)) {
    const { added, removed } = feature.support[browser]!;

    if (added === true) {
      support.set(browser, true);
    } else {
      const versions = expandVersions([browser, ">=", added]);

      if (removed !== undefined) {
        for (const version of expandVersions([browser, "<=", removed])) {
          versions.delete(version);
        }
      }

      support.set(browser, versions);
    }
  }
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

    if (support === true) {
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
