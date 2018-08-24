import { keys } from "@siteimprove/alfa-util";
import { Browsers } from "./browsers";
import { Features } from "./features";
import { BrowserQuery, FeatureName } from "./types";

export interface FeatureSupport {
  readonly supported: ReadonlyArray<BrowserQuery>;
  readonly unsupported: ReadonlyArray<BrowserQuery>;
}

const features: Map<FeatureName, FeatureSupport> = new Map();

for (const name of keys(Features)) {
  const feature = Features[name];

  const supported: Array<BrowserQuery> = [];
  const unsupported: Array<BrowserQuery> = [];

  features.set(name, { supported, unsupported });

  for (const browser of keys(feature.support)) {
    const { added, removed } = feature.support[browser]!;

    if (added === true) {
      supported.push(browser);
    } else {
      const versions = keys(Browsers[browser].releases);

      const previous = versions.indexOf(added) - 1;

      if (previous in versions) {
        unsupported.push([browser, "<", added]);
      }

      if (removed === undefined) {
        supported.push([browser, ">=", added]);
      } else {
        unsupported.push([browser, ">=", removed]);

        const previous = versions.indexOf(removed) - 1;

        if (previous in versions) {
          const removed = versions[previous];

          if (typeof removed === "string") {
            supported.push([browser, added, removed]);
          }
        }
      }
    }
  }
}

export function getFeatureSupport(name: FeatureName): FeatureSupport {
  return features.get(name)!;
}
