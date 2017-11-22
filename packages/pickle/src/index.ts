import * as V from '@endal/dom'

const { isParent } = V
const { assign } = Object

function serialize (node: Node): string {
  switch (node.nodeType) {
    // https://w3c.github.io/DOM-Parsing/#dfn-xml-serializing-a-text-node
    case node.TEXT_NODE: {
      const text = node as Text
      return text.data
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // https://w3c.github.io/DOM-Parsing/#xml-serializing-a-comment-node
    case node.COMMENT_NODE: {
      const comment = node as Comment
      return `<!--${comment.data}-->`;
    }

    // https://w3c.github.io/DOM-Parsing/#xml-serializing-a-documenttype-node
    case node.DOCUMENT_TYPE_NODE: {
      const doctype = node as DocumentType
      return `<!DOCTYPE ${doctype.name}` +
        (doctype.publicId ? ` PUBLIC "${doctype.publicId}"` : doctype.systemId ? ' SYSTEM' : '') +
        (doctype.systemId ? ` "${doctype.systemId}"` : '') +
        '>';
    }

    default:
      throw new Error(`Cannot serialize node of type "${node.nodeType}"`)
  }
}

export interface VirtualizeOptions {
  parents: boolean
}

function children (node: Node, virtual: V.ParentNode, options: Partial<VirtualizeOptions> = {}): void {
  const { childNodes } = node

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]

    const vchild: V.ChildNode = assign(virtualize(child, options), {
      parent: options.parents === true ? virtual : null
    })

    virtual.children[i] = vchild
  }
}

export function virtualize (node: Node, options: Partial<VirtualizeOptions> = {}): V.Node {
  switch (node.nodeType) {
    case node.ELEMENT_NODE: {
      const element = node as Element

      const { attributes } = element

      const virtual: V.Element = {
        type: 'element',
        tag: element.tagName.toLowerCase(),
        namespace: element.namespaceURI,
        attributes: {},
        parent: null,
        children: []
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

      const virtual: V.Text = {
        type: 'text',
        value: serialize(text),
        parent: null
      }

      return virtual
    }

    case node.COMMENT_NODE: {
      const comment = node as Comment

      const virtual: V.Comment = {
        type: 'comment',
        value: serialize(comment),
        parent: null
      }

      return virtual
    }

    case node.DOCUMENT_NODE: {
      const document = node as Document

      const { childNodes } = document

      const virtual: V.Document = {
        type: 'document',
        children: []
      }

      children(document, virtual, options)

      return virtual
    }

    case node.DOCUMENT_TYPE_NODE: {
      const doctype = node as DocumentType

      const virtual: V.Doctype = {
        type: 'doctype',
        value: serialize(doctype),
        parent: null
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
