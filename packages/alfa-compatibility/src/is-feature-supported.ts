/// <reference path="../types/caniuse-api.d.ts" />

import { isSupported } from "caniuse-api";
import { getSupportedBrowsers } from "./supported-browsers";

/**
 * Given the name of a feature, check if it is supported by the current browser
 * scope.
 *
 * @see https://caniuse.com/
 */
export function isFeatureSupported(
  feature: string,
  options: Readonly<{ browsers?: string | ReadonlyArray<string> }> = {}
): boolean {
  const browsers =
    options.browsers === undefined ? getSupportedBrowsers() : options.browsers;

  return isSupported(feature, browsers);
}
