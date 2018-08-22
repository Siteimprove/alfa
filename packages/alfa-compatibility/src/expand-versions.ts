import { Browsers } from "./browsers";
import { BrowserQuery, Version } from "./types";

const { keys } = Object;

/**
 * @internal
 */
export function expandVersions(browser: BrowserQuery): Set<Version> {
  const versions: Set<Version> = new Set();

  if (typeof browser === "string") {
    const { releases } = Browsers[browser];

    for (const version of keys(releases)) {
      versions.add(version);
    }

    return versions;
  }

  const name = browser[0];
  const { releases } = Browsers[name];

  if (browser.length === 2) {
    const version = browser[1];

    if (version in releases) {
      versions.add(version);
    } else {
      throw new Error(`Invalid browser version: ${name} ${version}`);
    }

    return versions;
  }

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
  } else {
    throw new Error(
      `Invalid browser version: ${name} ${comparator} ${version}`
    );
  }

  return versions;
}
