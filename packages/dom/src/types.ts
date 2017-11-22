export type Attribute = string | number | boolean

export interface Node {
  readonly type: string
}

export interface ParentNode extends Node {
  readonly children: Array<ChildNode>
}

export interface ChildNode extends Node {
  readonly parent: ParentNode | null
}

export interface Document extends Node, ParentNode {
  readonly type: 'document'
}

export interface Doctype extends Node, ChildNode {
  readonly type: 'doctype'
  readonly value: string
}

export interface Comment extends Node, ChildNode {
  readonly type: 'comment'
  readonly value: string
}

export interface Fragment extends Node, ParentNode, ChildNode {
  readonly type: 'fragment'
}

export interface Element extends Node, ParentNode, ChildNode {
  readonly type: 'element'
  readonly tag: string
  readonly namespace: string | null
  readonly attributes: { [name: string]: Attribute }
}

export interface Text extends Node, ChildNode {
  readonly type: 'text'
  readonly value: string
}
