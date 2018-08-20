import { Browser } from "./types";

/**
 * @internal
 */
export function getBrowser(name: string): Browser | null {
  switch (name) {
    case "chrome":
      return Browser.Chrome;
    case "edge":
      return Browser.Edge;
    case "firefox":
      return Browser.Firefox;
    case "ie":
      return Browser.IE;
    case "opera":
      return Browser.Opera;
    case "safari":
      return Browser.Safari;
  }

  return null;
}
