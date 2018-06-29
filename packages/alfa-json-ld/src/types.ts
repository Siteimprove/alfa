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

export type Terms<C> = Exclude<keyof C, Keyword>;

export type Definitions<C> = {
  readonly [P in Terms<C>]: string | Identifier & Type
};

export type Properties<C> = {
  readonly [P in Terms<C>]?: string | number | Identifier
};

export type Context<C> = Definitions<C> & Partial<Identifier & Vocabulary>;

export type Node<C extends Context<C>> = Properties<C> &
  Partial<Identifier> & {
    readonly "@context": C;
  };
