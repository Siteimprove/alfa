import { Browsers } from "./browsers";
import { BrowserName } from "./types";

/**
 * @internal
 */
export function isBrowserName(name: string): name is BrowserName {
  return name in Browsers;
}
