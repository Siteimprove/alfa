export type Attribute = string | number | boolean;

export interface Node {
  readonly type: string;
}

export interface ParentNode extends Node {
  readonly children: Array<ChildNode>;
}

export interface ChildNode extends Node {
  readonly parent: ParentNode | null;
}

export interface Document extends Node, ParentNode {
  readonly type: "document";
}

export interface DocumentType extends Node, ChildNode {
  readonly type: "documenttype";
  readonly value: string;
}

export interface DocumentFragment extends Node, ParentNode, ChildNode {
  readonly type: "documentfragment";
}

export interface Comment extends Node, ChildNode {
  readonly type: "comment";
  readonly value: string;
}

export interface Element extends Node, ParentNode, ChildNode {
  readonly type: "element";
  readonly tag: string;
  readonly namespace: string | null;
  readonly attributes: {
    readonly [name: string]: Attribute | undefined;
    readonly id?: string;
    readonly class?: string;
  };
  readonly shadow: DocumentFragment | null;
}

export interface Text extends Node, ChildNode {
  readonly type: "text";
  readonly value: string;
}
