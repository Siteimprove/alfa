import * as V from '@endal/dom'
import { Style, State, properties, clean, deduplicate } from '@endal/css'
import { Layout } from '@endal/layout'
import { WithReference, hasReference } from './reference'

const { assign, keys } = Object
const { isParent, isElement, traverse } = V

export interface VirtualizeOptions {
  parents?: boolean
}

function serialize (node: Node): string {
  switch (node.nodeType) {
    // https://w3c.github.io/DOM-Parsing/#dfn-xml-serializing-a-text-node
    case node.TEXT_NODE: {
      const text = node as Text
      return text.data
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }

    // https://w3c.github.io/DOM-Parsing/#xml-serializing-a-comment-node
    case node.COMMENT_NODE: {
      const comment = node as Comment
      return `<!--${comment.data}-->`
    }

    // https://w3c.github.io/DOM-Parsing/#xml-serializing-a-documenttype-node
    case node.DOCUMENT_TYPE_NODE: {
      const doctype = node as DocumentType
      return `<!DOCTYPE ${doctype.name}` +
        (doctype.publicId ? ` PUBLIC "${doctype.publicId}"` : doctype.systemId ? ' SYSTEM' : '') +
        (doctype.systemId ? ` "${doctype.systemId}"` : '') +
        '>'
    }

    default:
      throw new Error(`Cannot serialize node of type "${node.nodeType}"`)
  }
}

function children (node: Node, virtual: V.ParentNode, options: VirtualizeOptions = {}): void {
  const { childNodes } = node

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]

    const vchild: V.ChildNode = assign(virtualize(child, options), {
      parent: options.parents === true ? virtual : null
    })

    virtual.children[i] = vchild
  }
}

export function virtualize (node: Node, options: VirtualizeOptions = {}): WithReference<V.Node> {
  switch (node.nodeType) {
    case node.ELEMENT_NODE: {
      const element = node as Element

      const { attributes } = element

      const virtual: WithReference<V.Element> = {
        type: 'element',
        tag: element.tagName.toLowerCase(),
        namespace: element.namespaceURI,
        attributes: {},
        parent: null,
        children: [],
        ref: element
      }

      for (let i = 0; i < attributes.length; i++) {
        const { name, value } = attributes[i]
        virtual.attributes[name] = value
      }

      children(element, virtual, options)

      return virtual
    }

    case node.TEXT_NODE: {
      const text = node as Text

      const virtual: WithReference<V.Text> = {
        type: 'text',
        value: serialize(text),
        parent: null,
        ref: text
      }

      return virtual
    }

    case node.COMMENT_NODE: {
      const comment = node as Comment

      const virtual: WithReference<V.Comment> = {
        type: 'comment',
        value: serialize(comment),
        parent: null,
        ref: comment
      }

      return virtual
    }

    case node.DOCUMENT_NODE: {
      const document = node as Document

      const virtual: WithReference<V.Document> = {
        type: 'document',
        children: [],
        ref: document
      }

      children(document, virtual, options)

      return virtual
    }

    case node.DOCUMENT_TYPE_NODE: {
      const doctype = node as DocumentType

      const virtual: WithReference<V.DocumentType> = {
        type: 'documenttype',
        value: serialize(doctype),
        parent: null,
        ref: doctype
      }

      return virtual
    }

    default:
      throw new Error(`Cannot virtualize node of type "${node.nodeType}"`)
  }
}

export function parentize (node: V.Node): V.Node {
  if (isParent(node)) {
    for (const child of node.children) {
      assign(parentize(child), { parent: node })
    }
  }

  return node
}

export function dereference (node: V.Node): V.Node {
  if (hasReference(node)) {
    delete node.ref
  }

  if (isParent(node)) {
    node.children.map(dereference)
  }

  return node
}

export function layout (root: WithReference<V.Node>): Map<V.Element, Layout> {
  const layout: Map<V.Element, Layout> = new Map()

  traverse(root, node => {
    if (isElement(node) && hasReference(node)) {
      const _layout = (node.ref as Element).getBoundingClientRect()

      if (_layout.width <= 0 || _layout.height <= 0) {
        return false
      }

      layout.set(node, {
        left: _layout.left,
        right: _layout.right,
        top: _layout.top,
        bottom: _layout.bottom
      })
    }
  })

  return layout
}

export function style (root: WithReference<V.Node>): Map<V.Element, { [S in State]: Style }> {
  const style: Map<V.Element, { [S in State]: Style }> = new Map()

  traverse(root, node => {
    if (isElement(node) && hasReference(node)) {
      const element = node.ref as HTMLElement
      const computed = getComputedStyle(element)
      const _style: { [S in State]: Style } = {
        default: {},
        focus: {}
      }

      for (const property of properties) {
        _style.default[property] = computed.getPropertyValue(property)
      }

      _style.default = clean(_style.default)

      if ('focus' in element && element.tabIndex >= -1) {
        element.focus()

        for (const property of properties) {
          _style.focus[property] = computed.getPropertyValue(property)
        }

        _style.focus = deduplicate(_style.default, clean(_style.focus))
      }

      style.set(node, _style)
    }
  })

  return style
}
