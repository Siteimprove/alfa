declare namespace JSX {
  interface Node {
    readonly nodeType: number;
    readonly childNodes: Array<Node>;
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
    readonly attributes: Array<Attribute>;
    readonly shadowRoot: null;
  }

  interface Text extends Node {
    readonly nodeType: 3;
    readonly data: string;
  }
}
