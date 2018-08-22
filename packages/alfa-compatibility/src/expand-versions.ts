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
      throw new Error(`Invalid browser query: [${browser.join(", ")}]`);
    }

    return versions;
  }

  let lower = 0;
  let upper = Infinity;

  switch (browser[1]) {
    case "<": {
      const version = browser[2];
      if (version in releases) {
        upper = releases[version].date - 1;
      }
      break;
    }

    case ">": {
      const version = browser[2];
      if (version in releases) {
        lower = releases[version].date + 1;
      }
      break;
    }

    case "<=": {
      const version = browser[2];
      if (version in releases) {
        upper = releases[version].date;
      }
      break;
    }

    case ">=": {
      const version = browser[2];
      if (version in releases) {
        lower = releases[version].date;
      }
      break;
    }

    default: {
      const from = browser[1];
      const to = browser[2];

      if (from in releases && to in releases) {
        lower = releases[from].date;
        upper = releases[to].date;
      }
    }
  }

  if (lower === 0 && upper === Infinity) {
    throw new Error(`Invalid browser query: [${browser.join(", ")}]`);
  }

  for (const version of keys(releases)) {
    const { date } = releases[version];

    if (date >= lower && date <= upper) {
      versions.add(version);
    }
  }

  return versions;
}
