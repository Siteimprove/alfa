import { Node, Element, Text, ParentNode, ChildNode } from './types'

export function isElement (node: Node): node is Element {
  return node.type === 'element'
}

export function isText (node: Node): node is Text {
  return node.type === 'text'
}

export function isParent (node: Node): node is ParentNode {
  return 'children' in node
}

export function isChild (node: Node): node is ChildNode {
  return 'parent' in node
}
