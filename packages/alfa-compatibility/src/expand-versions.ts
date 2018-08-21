import { Browsers } from "./browsers";
import { BrowserName, Comparator, Version } from "./types";

const { keys } = Object;

/**
 * @internal
 */
export function expandVersions(
  browser: [BrowserName, Version] | [BrowserName, Comparator, Version]
): Set<Version> {
  const versions: Set<Version> = new Set();
  const name = browser[0];
  const { releases } = Browsers[name];

  if (browser.length === 2) {
    const version = browser[1];

    if (version in releases) {
      versions.add(version);
    }
  } else {
    const comparator = browser[1];
    const version = browser[2];

    if (version in releases) {
      const release = releases[version];

      for (const version of keys(releases)) {
        const found = releases[version];

        switch (comparator) {
          case "<":
            if (found.date < release.date) {
              versions.add(version);
            }
            break;

          case ">":
            if (found.date > release.date) {
              versions.add(version);
            }
            break;

          case "<=":
            if (found.date <= release.date) {
              versions.add(version);
            }
            break;

          case ">=":
            if (found.date >= release.date) {
              versions.add(version);
            }
        }
      }
    }
  }

  return versions;
}
