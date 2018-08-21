export type Comparator = ">" | "<" | ">=" | "<=";

export type Version = string;

export const enum Browser {
  /**
   * @see https://en.wikipedia.org/wiki/Google_Chrome
   */
  Chrome = "chrome",

  /**
   * @see https://en.wikipedia.org/wiki/Microsoft_Edge
   */
  Edge = "edge",

  /**
   * @see https://en.wikipedia.org/wiki/Firefox
   */
  Firefox = "firefox",

  /**
   * @see https://en.wikipedia.org/wiki/Internet_Explorer
   */
  IE = "ie",

  /**
   * @see https://en.wikipedia.org/wiki/Opera_(web_browser)
   */
  Opera = "opera",

  /**
   * @see https://en.wikipedia.org/wiki/Safari_(web_browser)
   */
  Safari = "safari"
}

/**
 * @internal
 */
export interface FeatureSupport {
  readonly added: Version | boolean;
  readonly removed?: Version | boolean;
}

/**
 * @internal
 */
export interface Feature {
  readonly support: Readonly<{ [browser in Browser]?: FeatureSupport }>;
}
