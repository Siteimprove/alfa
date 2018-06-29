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

export type Definitions<C> = {
  readonly [P in Exclude<keyof C, Keyword>]:
    | string
    | Identifier & { readonly "@type": string }
};

export type Context<C> = Definitions<C> & Partial<Identifier>;

export type ContextWithVocabulary<C, V extends Context<V> = V> = Context<C> & {
  readonly "@vocab": V;
};

export type Terms<C extends Context<C>> = {
  readonly [P in Exclude<
    C extends ContextWithVocabulary<C> ? keyof C | keyof C["@vocab"] : keyof C,
    Keyword
  >]?: string | Identifier
};

export type Node<C extends Context<C>> = Terms<C> & {
  readonly "@context": C;
};
