export interface Node {
  readonly type: string;
}

export interface Parent extends Node {
  readonly children: Array<Child>;
}

export interface Child extends Node {
  readonly parent: Parent | null;
}

export interface Document extends Node, Parent {
  readonly type: "document";
}

export interface DocumentType extends Node, Child {
  readonly type: "documentType";
  readonly value: string;
}

export interface DocumentFragment extends Node, Parent, Child {
  readonly type: "documentFragment";
}

export interface Comment extends Node, Child {
  readonly type: "comment";
  readonly value: string;
}

export type Attribute = string | number | boolean;

export interface Element extends Node, Parent, Child {
  readonly type: "element";
  readonly tag: string;
  readonly namespace: string | null;
  readonly attributes: Readonly<{
    [name: string]: Attribute | undefined;
    id?: string;
    class?: string;
  }>;
  readonly shadow: DocumentFragment | null;
}

export interface Text extends Node, Child {
  readonly type: "text";
  readonly value: string;
}
