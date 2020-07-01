/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { Cheerio } from "@siteimprove/alfa-cheerio";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Block,
  Comment,
  Declaration,
  Document,
  Element,
  Node,
  Text,
  Type,
} from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { Wrapper } from "@vue/test-utils";
import V from "vue";

const { isObject } = Predicate;

export namespace Vue {
  export type Type = Wrapper<V | null> | Cheerio.Type;

  export function isType(value: unknown): value is Type {
    return (
      (isObject(value) &&
        value.vm !== undefined &&
        value.element instanceof Element) ||
      Cheerio.isType(value)
    );
  }

  export function asPage(value: Type): Page {
    if (Cheerio.isType(value)) {
      return Cheerio.asPage(value);
    }

    return Page.of(
      Request.empty(),
      Response.empty(),
      Document.of([Element.from(toElement(value.element))]),
      Device.standard()
    );
  }
}

function toNode(node: globalThis.Node): Node.JSON {
  switch (node.nodeType) {
    case node.ELEMENT_NODE:
      return toElement(node as globalThis.Element);

    case node.ATTRIBUTE_NODE:
      return toAttribute(node as globalThis.Attr);

    case node.TEXT_NODE:
      return toText(node as globalThis.Text);

    case node.COMMENT_NODE:
      return toComment(node as globalThis.Comment);

    case node.DOCUMENT_NODE:
      return toDocument(node as globalThis.Document);

    case node.DOCUMENT_TYPE_NODE:
      return toType(node as globalThis.DocumentType);
  }

  throw new Error(`Unsupported node of type: ${node.nodeType}`);
}

function toElement(
  element: globalThis.Element | globalThis.HTMLElement | globalThis.SVGElement
): Element.JSON {
  return {
    type: "element",
    namespace: element.namespaceURI,
    prefix: element.prefix,
    name: element.localName,
    attributes: [...element.attributes].map(toAttribute),
    style: "style" in element ? toBlock(element.style) : null,
    children: [...element.childNodes].map(toNode),
    shadow: null,
    content: null,
  };
}

function toAttribute(attribute: globalThis.Attr): Attribute.JSON {
  return {
    type: "attribute",
    namespace: attribute.namespaceURI,
    prefix: attribute.prefix,
    name: attribute.localName,
    value: attribute.value,
  };
}

function toText(text: globalThis.Text): Text.JSON {
  return {
    type: "text",
    data: text.data,
  };
}

function toComment(comment: globalThis.Comment): Comment.JSON {
  return {
    type: "comment",
    data: comment.data,
  };
}

function toDocument(document: globalThis.Document): Document.JSON {
  return {
    type: "document",
    children: [...document.childNodes].map(toNode),
    style: [],
  };
}

function toType(type: globalThis.DocumentType): Type.JSON {
  return {
    type: "type",
    name: type.name,
    publicId: type.publicId === "" ? null : type.publicId,
    systemId: type.systemId === "" ? null : type.systemId,
  };
}

function toBlock(block: globalThis.CSSStyleDeclaration): Block.JSON {
  const declarations: Array<Declaration.JSON> = [];

  for (let i = 0, n = block.length; i < n; i++) {
    const name = block.item(i);
    const value = block.getPropertyValue(name);
    const important = block.getPropertyPriority(name) === "important";

    declarations.push({ name, value, important });
  }

  return declarations;
}
