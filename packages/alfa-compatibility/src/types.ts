import { BrowserName } from "./browsers";

export { BrowserName };
export { FeatureName } from "./features";

export type Comparator = ">" | "<" | ">=" | "<=";

export type Version = string;

export type BrowserQuery =
  /**
   * Request all versions of a given browser.
   */
  | BrowserName

  /**
   * Request a specific version of a given browser.
   */
  | [BrowserName, Version]

  /**
   * Request a range of browsers that satisfy a comparator.
   */
  | [BrowserName, Comparator, Version]

  /**
   * Request an inclusive range of browsers.
   */
  | [BrowserName, Version, Version];

/**
 * @internal
 */
export interface Release {
  readonly date: number;
}

/**
 * @internal
 */
export interface Browser {
  readonly name: string;
  readonly releases: Readonly<{ [version: string]: Release }>;
}

/**
 * @internal
 */
export interface Support {
  readonly added: Version | true;
  readonly removed?: Version;
}

/**
 * @internal
 */
export interface Feature {
  readonly support: Readonly<{ [P in BrowserName]?: Support }>;
}
