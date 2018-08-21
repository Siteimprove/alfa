import { BrowserName } from "./types";

/**
 * @internal
 */
export function isBrowserName(name: string): name is BrowserName {
  switch (name) {
    case "chrome":
    case "edge":
    case "firefox":
    case "ie":
    case "opera":
    case "safari":
      return true;
  }

  return false;
}
