import { Node, Document, Element, Text, Comment, ParentNode, ChildNode } from './types'

export function isDocument (node: Node): node is Document {
  return node.type === 'document'
}

export function isElement (node: Node): node is Element {
  return node.type === 'element'
}

export function isText (node: Node): node is Text {
  return node.type === 'text'
}

export function isComment (node: Node): node is Comment {
  return node.type === 'comment'
}

export function isParent (node: Node): node is ParentNode {
  return 'children' in node
}

export function isChild (node: Node): node is ChildNode {
  return 'parent' in node
}
