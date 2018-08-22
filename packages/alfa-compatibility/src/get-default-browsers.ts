/// <reference path="../types/browserslist.d.ts" />

import browserslist = require("browserslist");
import { Browsers } from "./browsers";
import { isBrowserName } from "./is-browser-name";
import { BrowserName, Version } from "./types";

const whitespace = /\s+/;

let defaultBrowsers: Map<BrowserName, Set<Version>> | undefined;

/**
 * @internal
 */
export function getDefaultBrowsers(): Map<BrowserName, Set<Version>> {
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
