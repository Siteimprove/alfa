/// <reference path="../types/browserslist.d.ts" />

import browserslist = require("browserslist");
import { getBrowser } from "./get-browser";
import { Browser, Version } from "./types";

const whitespace = /\s+/;

/**
 * @internal
 */
export function resolveQuery(query?: string): Map<Browser, Set<Version>> {
  const browsers: Map<Browser, Set<Version>> = new Map();

  for (const entry of browserslist(query)) {
    const [name, version] = entry.split(whitespace);

    const browser = getBrowser(name);

    if (browser === null) {
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
