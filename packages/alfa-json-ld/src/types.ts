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
  readonly [key: string]: Scalar | List | Dictionary | null | undefined;
}

export interface ListObject extends Dictionary {
  readonly "@list"?: List;
}

export interface ValueObject extends Dictionary {
  readonly "@value"?: Scalar;
}

export interface Definition extends Dictionary {
  readonly "@id": string;
  readonly "@reverse": boolean;
  readonly "@type"?: string;
  readonly "@language"?: string;
  readonly "@container"?: string;
}

export interface Context extends Dictionary {
  readonly "@version"?: 1.1;
  readonly "@base"?: string;
}

export interface Document extends Dictionary {
  readonly "@context"?: Context;
}
