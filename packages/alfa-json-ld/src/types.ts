/**
 * {@link https://www.w3.org/TR/json-ld/#syntax-tokens-and-keywords}
 *
 * @public
 */
export type Keyword =
  | "@context"
  | "@id"
  | "@value"
  | "@language"
  | "@type"
  | "@container"
  | "@list"
  | "@set"
  | "@reverse"
  | "@index"
  | "@base"
  | "@vocab"
  | "@graph";

/**
 * @public
 */
export type Scalar = string | number | boolean;

/**
 * @public
 */
export type List = Array<Scalar | Dictionary | null>;

/**
 * @public
 */
export interface Dictionary {
  [key: string]: Scalar | List | Dictionary | null | undefined;
}

/**
 * @public
 */
export interface ListObject extends Dictionary {
  "@list"?: List;
}

/**
 * @public
 */
export interface ValueObject extends Dictionary {
  "@value"?: Scalar;
}

/**
 * @public
 */
export interface Definition extends Dictionary {
  "@id": string;
  "@reverse": boolean;
  "@type"?: string;
  "@language"?: string;
  "@container"?: string;
}

/**
 * @public
 */
export interface Context extends Dictionary {
  "@version"?: 1.1;
  "@base"?: string;
}

/**
 * @public
 */
export interface Document extends Dictionary {
  "@context"?: Context;
}
