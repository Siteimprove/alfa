import * as V from "@alfa/dom";

const { assign } = Object;
const { isParent } = V;

export type WithReference<T extends V.Node> = T & { ref: Node };

export function hasReference<T extends V.Node>(
  node: T
): node is WithReference<T> {
  return "ref" in node;
}

export type VirtualizeOptions = Readonly<{
  parents?: boolean;
  references?: boolean;
}>;

function serialize(node: Node): string {
  switch (node.nodeType) {
    // https://w3c.github.io/DOM-Parsing/#dfn-xml-serializing-a-text-node
    case node.TEXT_NODE: {
      const text = node as Text;
      return text.data
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    // https://w3c.github.io/DOM-Parsing/#xml-serializing-a-comment-node
    case node.COMMENT_NODE: {
      const comment = node as Comment;
      return `<!--${comment.data}-->`;
    }

    // https://w3c.github.io/DOM-Parsing/#xml-serializing-a-documenttype-node
    case node.DOCUMENT_TYPE_NODE: {
      const doctype = node as DocumentType;
      return (
        `<!DOCTYPE ${doctype.name}` +
        (doctype.publicId
          ? ` PUBLIC "${doctype.publicId}"`
          : doctype.systemId ? " SYSTEM" : "") +
        (doctype.systemId ? ` "${doctype.systemId}"` : "") +
        ">"
      );
    }

    default:
      throw new Error(`Cannot serialize node of type "${node.nodeType}"`);
  }
}

function children(
  node: Node,
  virtual: V.Parent,
  options: VirtualizeOptions = {}
): void {
  const { childNodes } = node;

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];

    const vchild: V.Child = assign(virtualize(child, options), {
      parent: options.parents === false ? null : virtual
    });

    virtual.children[i] = vchild;
  }
}

export function virtualize(
  node: Node,
  options: VirtualizeOptions & { references: true }
): WithReference<V.Node>;

export function virtualize(node: Node, options?: VirtualizeOptions): V.Node;

export function virtualize(
  node: Node,
  options: VirtualizeOptions = {}
): WithReference<V.Node> | V.Node {
  switch (node.nodeType) {
    case node.ELEMENT_NODE: {
      const element = node as Element;
      const attributes: { [name: string]: V.Attribute } = {};

      for (let i = 0; i < element.attributes.length; i++) {
        const { name, value } = element.attributes[i];
        attributes[name] = value;
      }

      const virtual: V.Element = {
        type: "element",
        tag: element.tagName.toLowerCase(),
        namespace: element.namespaceURI,
        attributes,
        parent: null,
        shadow: null,
        children: []
      };

      if (options.references) {
        assign(virtual, { ref: element });
      }

      children(element, virtual, options);

      return virtual;
    }

    case node.TEXT_NODE: {
      const text = node as Text;

      const virtual: V.Text = {
        type: "text",
        value: serialize(text),
        parent: null
      };

      if (options.references) {
        assign(virtual, { ref: text });
      }

      return virtual;
    }

    case node.COMMENT_NODE: {
      const comment = node as Comment;

      const virtual: V.Comment = {
        type: "comment",
        value: serialize(comment),
        parent: null
      };

      if (options.references) {
        assign(virtual, { ref: comment });
      }

      return virtual;
    }

    case node.DOCUMENT_NODE: {
      const document = node as Document;

      const virtual: V.Document = {
        type: "document",
        children: []
      };

      if (options.references) {
        assign(virtual, { ref: document });
      }

      children(document, virtual, options);

      return virtual;
    }

    case node.DOCUMENT_TYPE_NODE: {
      const doctype = node as DocumentType;

      const virtual: V.DocumentType = {
        type: "documentType",
        value: serialize(doctype),
        parent: null
      };

      if (options.references) {
        assign(virtual, { ref: doctype });
      }

      return virtual;
    }

    case node.DOCUMENT_FRAGMENT_NODE: {
      const docfragment = node as DocumentFragment;

      const virtual: V.DocumentFragment = {
        type: "documentFragment",
        parent: null,
        children: []
      };

      if (options.references) {
        assign(virtual, { ref: docfragment });
      }

      children(docfragment, virtual, options);

      return virtual;
    }

    default:
      throw new Error(`Cannot virtualize node of type "${node.nodeType}"`);
  }
}

export function parentize(node: V.Node): V.Node {
  if (isParent(node)) {
    for (const child of node.children) {
      assign(parentize(child), { parent: node });
    }
  }

  return node;
}

export function dereference(node: V.Node): V.Node {
  if (hasReference(node)) {
    delete node.ref;
  }

  if (isParent(node)) {
    node.children.map(dereference);
  }

  return node;
}
