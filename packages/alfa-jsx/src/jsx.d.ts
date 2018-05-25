declare namespace JSX {
  interface IntrinsicElements {
    [tag: string]: any;
  }

  interface Node {
    readonly nodeType: number;
    readonly childNodes: ArrayLike<Node>;
  }

  interface Attribute {
    readonly namespaceURI: string | null;
    readonly prefix: string | null;
    readonly localName: string;
    readonly value: string;
  }

  interface Element extends Node {
    readonly nodeType: 1;
    readonly namespaceURI: string | null;
    readonly prefix: string | null;
    readonly localName: string;
    readonly attributes: ArrayLike<Attribute>;
    readonly shadowRoot: null;
  }

  interface Text extends Node {
    readonly nodeType: 3;
    readonly data: string;
  }
}
