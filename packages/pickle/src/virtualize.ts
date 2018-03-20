import * as V from "@alfa/dom";
import { style } from "./style";
import { layout } from "./layout";

const { assign } = Object;
const { isParent } = V;

export type WithReference<T extends V.Node> = T & { reference: Node };

export function hasReference<T extends V.Node>(
  node: T
): node is WithReference<T> {
  return "reference" in node;
}

export type VirtualizeOptions = Readonly<{
  parents?: boolean;
  references?: boolean;
  style?: boolean;
  layout?: boolean;
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
      parentNode: options.parents ? virtual : null
    });

    virtual.childNodes[i] = vchild;
  }
}

export function virtualize<T extends Element>(
  node: T,
  options?: VirtualizeOptions
): V.Element;

export function virtualize<T extends Text>(
  node: T,
  options?: VirtualizeOptions
): V.Text;

export function virtualize<T extends Comment>(
  node: T,
  options?: VirtualizeOptions
): V.Comment;

export function virtualize<T extends Document>(
  node: T,
  options?: VirtualizeOptions
): V.Document;

export function virtualize<T extends DocumentType>(
  node: T,
  options?: VirtualizeOptions
): V.DocumentType;

export function virtualize<T extends DocumentFragment>(
  node: T,
  options?: VirtualizeOptions
): V.DocumentFragment;

export function virtualize(node: Node, options?: VirtualizeOptions): V.Node;

export function virtualize(
  node: Node,
  options: VirtualizeOptions = {}
): V.Node {
  options = assign(
    {},
    {
      parents: true,
      references: false,
      style: false,
      layout: false
    },
    options
  );

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
        shadowRoot:
          element.shadowRoot === null
            ? null
            : virtualize(element.shadowRoot, options)
      };

      if (options.references) {
        assign(virtual, { reference: element });
      }

      if (options.style) {
        style(virtual, element);
      }

      if (options.layout) {
        layout(virtual, element);
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
        assign(virtual, { reference: text });
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
        assign(virtual, { reference: comment });
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
        assign(virtual, { reference: document });
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
        assign(virtual, { reference: doctype });
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
        assign(virtual, { reference: docfragment });
      }

      children(docfragment, virtual, options);

      return virtual;
    }

    default:
      throw new Error(`Cannot virtualize node of type "${node.nodeType}"`);
  }
}
