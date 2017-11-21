export interface Attribute {
  name: string
  value: string | number | boolean
}

function serialize (node: Node): string | null {
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
  }

  return null
}

function attributes (element: Element) {
  const attributes: Array<Attribute> = []

  for (let i = 0; i < element.attributes.length; i++) {
    const { name, value } = element.attributes.item(i)

    attributes.push({
      name,
      value
    })
  }

  return attributes
}
