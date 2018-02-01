import {
  Node,
  Document,
  DocumentType,
  Element,
  Text,
  Comment,
  Parent,
  Child
} from "./types";

export function isDocument(node: Node | null): node is Document {
  return node !== null && node.type === "document";
}

export function isDocumentType(node: Node | null): node is DocumentType {
  return node !== null && node.type === "documenttype";
}

export function isElement(node: Node | null): node is Element {
  return node !== null && node.type === "element";
}

export function isText(node: Node | null): node is Text {
  return node !== null && node.type === "text";
}

export function isComment(node: Node | null): node is Comment {
  return node !== null && node.type === "comment";
}

export function isParent(node: Node | null): node is Parent {
  return node !== null && "children" in node;
}

export function isChild(node: Node | null): node is Child {
  return node !== null && "parent" in node;
}
