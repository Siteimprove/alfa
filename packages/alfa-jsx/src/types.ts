export interface Node {
  readonly nodeType: number;
  readonly childNodes: ArrayLike<Node>;
}

export interface Element extends Node {
  readonly nodeType: 1;
  readonly prefix: string | null;
  readonly localName: string;
  readonly attributes: ArrayLike<Attribute>;
  readonly shadowRoot: ShadowRoot | null;
}

export interface Attribute extends Node {
  readonly nodeType: 2;
  readonly prefix: string | null;
  readonly localName: string;
  readonly value: string;
}

export interface Text extends Node {
  readonly nodeType: 3;
  readonly data: string;
}

export interface ShadowRoot extends Node {
  readonly nodeType: 11;
  readonly mode: "open";
}
