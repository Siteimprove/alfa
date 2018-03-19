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

function children(
  node: Node,
  virtual: V.ParentNode,
  options: VirtualizeOptions = {}
): void {
  const { childNodes } = node;

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];

    const vchild: V.ChildNode = assign(virtualize(child, options), {
      parentNode: options.parents === false ? null : virtual
    });

    virtual.childNodes[i] = vchild;
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
      const attributes: Array<V.Attr> = [];

      for (let i = 0; i < element.attributes.length; i++) {
        const { name, value } = element.attributes[i];
        attributes.push({ name, value });
      }

      const virtual: V.Element = {
        nodeType: 1,
        tagName: element.tagName.toLowerCase(),
        namespaceURI: element.namespaceURI,
        attributes,
        parentNode: null,
        childNodes: [],
        shadowRoot: null
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
        nodeType: 3,
        parentNode: null,
        childNodes: [],
        data: text.data
      };

      if (options.references) {
        assign(virtual, { ref: text });
      }

      return virtual;
    }

    case node.COMMENT_NODE: {
      const comment = node as Comment;

      const virtual: V.Comment = {
        nodeType: 8,
        parentNode: null,
        childNodes: [],
        data: comment.data
      };

      if (options.references) {
        assign(virtual, { ref: comment });
      }

      return virtual;
    }

    case node.DOCUMENT_NODE: {
      const document = node as Document;

      const virtual: V.Document = {
        nodeType: 9,
        parentNode: null,
        childNodes: []
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
        nodeType: 10,
        parentNode: null,
        childNodes: [],
        name: doctype.name
      };

      if (options.references) {
        assign(virtual, { ref: doctype });
      }

      return virtual;
    }

    case node.DOCUMENT_FRAGMENT_NODE: {
      const docfragment = node as DocumentFragment;

      const virtual: V.DocumentFragment = {
        nodeType: 11,
        parentNode: null,
        childNodes: []
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
    for (const child of node.childNodes) {
      assign(parentize(child), { parentNode: node });
    }
  }

  return node;
}

export function dereference(node: V.Node): V.Node {
  if (hasReference(node)) {
    delete node.ref;
  }

  if (isParent(node)) {
    node.childNodes.map(dereference);
  }

  return node;
}
