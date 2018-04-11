export interface Language {
  readonly primary: PrimaryLanguage;
  readonly extended?: ExtendedLanguage;
  readonly script?: Script;
  readonly region?: Region;
  readonly variants?: Array<Variant>;
}

/**
 * @see https://tools.ietf.org/html/bcp47#section-3.1.2
 */
export interface Subtag {
  /**
   * @see https://tools.ietf.org/html/bcp47#section-3.1.3
   */
  readonly type: string;

  /**
   * @see https://tools.ietf.org/html/bcp47#section-3.1.4
   */
  readonly name: string;
}

/**
 * @see https://tools.ietf.org/html/bcp47#section-2.2.1
 */
export interface PrimaryLanguage extends Subtag {
  readonly type: "language";

  /**
   * @see https://tools.ietf.org/html/bcp47#section-3.1.11
   */
  readonly scope?: "macrolanguage" | "collection" | "special" | "private-use";
}

/**
 * @see https://tools.ietf.org/html/bcp47#section-2.2.2
 */
export interface ExtendedLanguage extends Subtag {
  readonly type: "extlang";

  /**
   * @see https://tools.ietf.org/html/bcp47#section-3.1.8
   */
  readonly prefix: string;

  /**
   * @see https://tools.ietf.org/html/bcp47#section-3.1.11
   */
  readonly scope?: "macrolanguage" | "collection" | "special" | "private-use";
}

/**
 * @see https://tools.ietf.org/html/bcp47#section-2.2.3
 */
export interface Script extends Subtag {
  readonly type: "script";
}

/**
 * @see https://tools.ietf.org/html/bcp47#section-2.2.4
 */
export interface Region extends Subtag {
  readonly type: "region";
}

/**
 * @see https://tools.ietf.org/html/bcp47#section-2.2.5
 */
export interface Variant extends Subtag {
  readonly type: "variant";

  /**
   * @see https://tools.ietf.org/html/bcp47#section-3.1.8
   */
  readonly prefix?: string | Array<string>;
}
