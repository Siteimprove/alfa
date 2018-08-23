import { BrowserName } from "./browsers";

export { BrowserName };
export { FeatureName } from "./features";

export type Comparator = ">" | "<" | ">=" | "<=";

export type Version = string;

export type BrowserQuery<T extends BrowserName = BrowserName> =
  /**
   * Request any version of a given browser.
   */
  | T

  /**
   * Request a specific version of a given browser.
   */
  | [T, Version]

  /**
   * Request a range of browser versions that satisfy a comparator.
   */
  | [T, Comparator, Version]

  /**
   * Request an inclusive range of browser versions.
   */
  | [T, Version, Version];

/**
 * @internal
 */
export type VersionSet = true | Set<Version>;

/**
 * @internal
 */
export interface Browser {
  readonly name: string;
  readonly releases: {
    readonly [version: string]: {
      readonly date: number;
    };
  };
}

/**
 * @internal
 */
export interface Feature {
  readonly support: {
    readonly [P in BrowserName]?: {
      readonly added: Version | true;
      readonly removed?: Version;
    }
  };
}
