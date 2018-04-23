declare namespace JSX {
  interface Node {
    readonly nodeType: number;
    readonly childNodes: Array<Node>;
  }

  interface Element extends Node {
    readonly nodeType: 1;
    readonly namespaceURI: string | null;
    readonly tagName: string;
    readonly attributes: Array<{ name: string; value: string }>;
    readonly shadowRoot: null;
  }

  interface Text extends Node {
    readonly nodeType: 3;
    readonly data: string;
  }
}
