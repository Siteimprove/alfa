import { set } from "@alfa/util";
import * as V from "@alfa/dom";
import { StyleSheet } from "@alfa/style";
import { LayoutSheet } from "@alfa/layout";
import { style } from "./style";
import { layout } from "./layout";

const { isParent } = V;

export interface Sheets {
  readonly style: StyleSheet;
  readonly layout: LayoutSheet;
}

export function virtualize(node: Element, sheets?: Sheets): V.Element;

export function virtualize(node: Text, sheets?: Sheets): V.Text;

export function virtualize(node: Comment, sheets?: Sheets): V.Comment;

export function virtualize(node: Document, sheets?: Sheets): V.Document;

export function virtualize(node: DocumentType, sheets?: Sheets): V.DocumentType;

export function virtualize(node: ShadowRoot, sheets?: Sheets): V.ShadowRoot;

export function virtualize(
  node: DocumentFragment,
  sheets?: Sheets
): V.DocumentFragment;

export function virtualize(node: Node, sheets?: Sheets): V.Node;

export function virtualize(
  node: Node,
  sheets?: { style: StyleSheet; layout: LayoutSheet }
): V.Node {
  switch (node.nodeType) {
    case node.ELEMENT_NODE: {
      const element = node as Element;
      const attributes: Array<V.Attribute> = [];

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

      if (element.shadowRoot !== null) {
        set(
          virtual,
          "shadowRoot",
          set(virtualize(element.shadowRoot, sheets), "host", virtual)
        );
      }

      if (sheets !== undefined) {
        sheets.style.push({ element: virtual, style: style(element) });
        sheets.layout.push({ element: virtual, layout: layout(element) });
      }

      children(node, virtual, sheets);

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

      return virtual;
    }

    case node.DOCUMENT_NODE: {
      const document = node as Document;

      const virtual: V.Document = {
        nodeType: 9,
        parentNode: null,
        childNodes: []
      };

      children(node, virtual, sheets);

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

      return virtual;
    }

    case node.DOCUMENT_FRAGMENT_NODE: {
      let virtual: V.DocumentFragment | V.ShadowRoot;

      if ("host" in node) {
        virtual = {
          nodeType: 11,
          parentNode: null,
          childNodes: [],
          host: null
        };
      } else {
        virtual = {
          nodeType: 11,
          parentNode: null,
          childNodes: []
        };
      }

      children(node, virtual, sheets);

      return virtual;
    }

    default:
      throw new Error(`Cannot virtualize node of type "${node.nodeType}"`);
  }
}

function children(node: Node, virtual: V.ParentNode, sheets?: Sheets): void {
  const { childNodes } = node;

  for (let i = 0; i < childNodes.length; i++) {
    virtual.childNodes[i] = set(
      virtualize(childNodes[i], sheets),
      "parentNode",
      virtual
    );
  }
}

function focusTarget(element: HTMLElement): HTMLElement | null {
  if ("focus" in element && element.tabIndex >= -1) {
    return element;
  }

  if (element.parentElement !== null) {
    return focusTarget(element.parentElement);
  }

  return null;
}
