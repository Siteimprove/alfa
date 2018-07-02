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

export type WithId = {
  readonly "@id": string;
};

export type WithType<T = any> = {
  readonly "@type": T;
};

export type WithVocab = {
  readonly "@vocab": string;
};

export type WithPrefix = {
  readonly "@prefix": boolean;
};

export type WithContext<T> = {
  readonly "@context": Definitions<T> & Partial<WithId & WithVocab>;
};

export type Terms<T> = Exclude<keyof T, Keyword>;

export type Value<T> = T extends "@id" ? WithId : T;

export type Definitions<T> = {
  readonly [P in Terms<T>]: string | WithId & (WithType | WithPrefix)
};

export type Properties<T> = {
  readonly [P in Terms<T>]?: T[P] extends WithType<infer U>
    ? Value<U>
    : string | number | boolean
};

export type Node<T> = WithContext<T> & Partial<WithId> & Properties<T>;
