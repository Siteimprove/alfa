import {
  Node,
  Document,
  DocumentType,
  DocumentFragment,
  ShadowRoot,
  Element,
  Text,
  Comment,
  ParentNode,
  ChildNode
} from "./types";

export function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

export function isText(node: Node): node is Text {
  return node.nodeType === 3;
}

export function isComment(node: Node): node is Comment {
  return node.nodeType === 8;
}

export function isDocument(node: Node): node is Document {
  return node.nodeType === 9;
}

export function isDocumentType(node: Node): node is DocumentType {
  return node.nodeType === 10;
}

export function isDocumentFragment(node: Node): node is DocumentFragment {
  return node.nodeType === 11;
}

export function isShadowRoot(node: Node): node is ShadowRoot {
  return isDocumentFragment(node);
}

export function isParent(node: Node): node is ParentNode {
  return isElement(node) || isDocument(node) || isDocumentFragment(node);
}

export function isChild(node: Node): node is ChildNode {
  return (
    isElement(node) || isText(node) || isComment(node) || isDocumentType(node)
  );
}
