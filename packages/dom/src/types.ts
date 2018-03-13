/**
 * @see https://www.w3.org/TR/dom/#interface-node
 */
export interface Node {
  readonly type: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-parentnode
 */
export interface Parent extends Node {
  readonly children: Array<Child>;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-childnode
 */
export interface Child extends Node {
  readonly parent: Parent | null;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-document
 */
export interface Document extends Node, Parent {
  readonly type: "document";
}

/**
 * @see https://www.w3.org/TR/dom/#interface-documenttype
 */
export interface DocumentType extends Node, Child {
  readonly type: "documentType";
  readonly name: string;
  readonly publicId: string;
  readonly systemId: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-documentfragment
 */
export interface DocumentFragment extends Node, Parent, Child {
  readonly type: "documentFragment";
}

/**
 * @see https://www.w3.org/TR/dom/#interface-comment
 */
export interface Comment extends Node, Child {
  readonly type: "comment";
  readonly value: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-attr
 */
export type Attribute = string | number | boolean;

/**
 * @see https://www.w3.org/TR/dom/#interface-element
 */
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

/**
 * @see https://www.w3.org/TR/dom/#interface-text
 */
export interface Text extends Node, Child {
  readonly type: "text";
  readonly value: string;
}
