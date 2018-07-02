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

export type Identifier = {
  readonly "@id": string;
};

export type Type = {
  readonly "@type": string;
};

export type Vocabulary = {
  readonly "@vocab": string;
};

export type Prefix = {
  readonly "@prefix": boolean;
};

export type Context<T> = {
  readonly "@context": Definitions<T> & Partial<Identifier & Vocabulary>;
};

export type Terms<T> = Exclude<keyof T, Keyword>;

export type Definitions<T> = {
  readonly [P in Terms<T>]: string | Identifier & (Type | Prefix)
};

export type Properties<T> = {
  readonly [P in Terms<T>]?: string | number | Identifier
};

export type Node<T> = Context<T> & Properties<T> & Partial<Identifier>;
