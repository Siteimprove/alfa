/**
 * @see https://www.w3.org/TR/json-ld/#syntax-tokens-and-keywords
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

export type Scalar = string | number | boolean;

export type List = Array<Scalar | Dictionary | null>;

export interface Dictionary {
  [key: string]: Scalar | List | Dictionary | null | undefined;
}

export interface ListObject extends Dictionary {
  "@list"?: List;
}

export interface ValueObject extends Dictionary {
  "@value"?: Scalar;
}

export interface Definition extends Dictionary {
  "@id": string;
  "@reverse": boolean;
  "@type"?: string;
  "@language"?: string;
  "@container"?: string;
}

export interface Context extends Dictionary {
  "@version"?: 1.1;
  "@base"?: string;
}

export interface Document extends Dictionary {
  "@context"?: Context;
}
