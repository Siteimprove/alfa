/// <reference path="../types/browserslist.d.ts" />

import browserslist = require("browserslist");
import { Browsers } from "./browsers";
import { isBrowserName } from "./guards";
import { BrowserName, Version, VersionSet } from "./types";

const whitespace = /\s+/;

/**
 * NB: Since browserslist forces separate versions of browsers, we map browsers
 * to actual sets of version numbers rather than `VersionSet`.
 */
let defaultBrowsers: Map<BrowserName, Set<Version>> | undefined;

/**
 * @internal
 */
export function getDefaultBrowsers(): Map<BrowserName, VersionSet> {
  if (defaultBrowsers === undefined) {
    defaultBrowsers = new Map();

    for (const entry of browserslist()) {
      const [name, version] = entry.split(whitespace);

      if (!isBrowserName(name)) {
        continue;
      }

      const { releases } = Browsers[name];

      if (version in releases === false) {
        continue;
      }

      let versions = defaultBrowsers.get(name);

      if (versions === undefined) {
        versions = new Set();
        defaultBrowsers.set(name, versions);
      }

      versions.add(version);
    }
  }

  return defaultBrowsers;
}
