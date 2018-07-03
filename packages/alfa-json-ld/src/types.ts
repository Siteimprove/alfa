/**
 * @see https://json-ld.org/spec/latest/json-ld/#syntax-tokens-and-keywords
 */
export type Keyword =
  | "@base"
  | "@container"
  | "@context"
  | "@graph"
  | "@id"
  | "@index"
  | "@language"
  | "@list"
  | "@nest"
  | "@none"
  | "@prefix"
  | "@reverse"
  | "@set"
  | "@type"
  | "@value"
  | "@version"
  | "@vocab";

export const Id: "@id" = "@id";

export interface WithId {
  readonly "@id": string;
}

export interface WithType<T = string> {
  readonly "@type": T;
}

export interface WithVocab {
  readonly "@vocab": string;
}

export interface WithPrefix {
  readonly "@prefix": boolean;
}

export interface WithContext<T> {
  readonly "@context": Definitions<T> & Partial<WithId & WithVocab>;
}

export type Terms<T> = Exclude<keyof T, Keyword>;

export type Value<T> = T extends "@id" ? WithId : string | number | boolean;

export type Definitions<T> = {
  readonly [P in Terms<T>]: string | WithId & Partial<WithType | WithPrefix>
};

export type Properties<T> = {
  readonly [P in Terms<T>]?: Value<T[P] extends WithType<infer U> ? U : string>
};

export type Node<T> = WithContext<T> &
  Partial<WithId & WithType> &
  Properties<T>;
