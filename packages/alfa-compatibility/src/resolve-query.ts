/// <reference path="../types/browserslist.d.ts" />

import browserslist = require("browserslist");
import { isBrowserName } from "./is-browser-name";
import { BrowserName, Version } from "./types";

const whitespace = /\s+/;

/**
 * @internal
 */
export function resolveQuery(query?: string): Map<BrowserName, Set<Version>> {
  const browsers: Map<BrowserName, Set<Version>> = new Map();

  for (const entry of browserslist(query)) {
    const [browser, version] = entry.split(whitespace);

    if (!isBrowserName(browser)) {
      continue;
    }

    let versions = browsers.get(browser);

    if (versions === undefined) {
      versions = new Set();
      browsers.set(browser, versions);
    }

    versions.add(version);
  }

  return browsers;
}
