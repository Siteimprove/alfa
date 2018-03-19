/**
 * @see https://www.w3.org/TR/dom/#interface-node
 */
export interface Node {
  readonly nodeType: number;
  readonly parentNode: Node | null;
  readonly childNodes: Array<Node>;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-parentnode
 */
export interface ParentNode extends Node {}

/**
 * @see https://www.w3.org/TR/dom/#interface-childnode
 */
export interface ChildNode extends Node {}

/**
 * @see https://www.w3.org/TR/dom/#interface-attr
 */
export interface Attr {
  readonly name: string;
  readonly value: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-element
 */
export interface Element extends Node, ParentNode, ChildNode {
  readonly nodeType: 1;
  readonly namespaceURI: string | null;
  readonly tagName: string;
  readonly attributes: Array<Attr>;
  readonly shadowRoot: DocumentFragment | null;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-text
 */
export interface Text extends Node, ChildNode {
  readonly nodeType: 3;
  readonly data: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-comment
 */
export interface Comment extends Node, ChildNode {
  readonly nodeType: 8;
  readonly data: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-document
 */
export interface Document extends Node, ParentNode {
  readonly nodeType: 9;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-documenttype
 */
export interface DocumentType extends Node, ChildNode {
  readonly nodeType: 10;
  readonly name: string;
}

/**
 * @see https://www.w3.org/TR/dom/#interface-documentfragment
 */
export interface DocumentFragment extends Node, ParentNode {
  readonly nodeType: 11;
}
