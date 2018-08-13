/// <reference path="../types/browserslist.d.ts" />
/// <reference path="../types/caniuse-api.d.ts" />

import browserslist = require("browserslist");
import { isSupported } from "caniuse-api";

const supportedBrowsers = browserslist();

/**
 * Given the name of a feature, check if it is supported by the current browser
 * scope.
 *
 * @see https://caniuse.com/
 */
export function isFeatureSupported(
  feature: string,
  options: Readonly<{ browsers?: string | Array<string> }> = {}
): boolean {
  const browsers =
    options.browsers === undefined ? supportedBrowsers : options.browsers;

  return isSupported(feature, browsers);
}
