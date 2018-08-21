import { keys } from "@siteimprove/alfa-util";
import { expandBrowsers } from "./expand-browsers";
import { FeatureName, Features } from "./features";
import { resolveQuery } from "./resolve-query";
import { getSupportedBrowsers } from "./supported-browsers";
import { BrowserName, Comparator, Version } from "./types";

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

    support.set(
      browser,
      added === true
        ? true
        : resolveQuery(
            `${browser} >= ${added}${
              removed !== undefined && removed !== false
                ? `, not ${browser} >= ${removed}`
                : ""
            }`
          ).get(browser)!
    );
  }
}

/**
 * Given the name of a feature, check if it is supported by the current browser
 * scope.
 */
export function isFeatureSupported(
  name: FeatureName,
  options: Readonly<{
    browsers?: ReadonlyArray<
      [BrowserName, Version] | [BrowserName, Comparator, Version]
    >;
  }> = {}
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
