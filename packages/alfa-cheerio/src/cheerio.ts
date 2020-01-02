import {
  Attribute,
  Element,
  Node,
  Text,
  Document,
  Namespace
} from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";

import * as cheerio from "cheerio";

const { keys } = Object;

export namespace Cheerio {
  export type Type = Cheerio;

  export function isType(value: unknown): value is Type {
    return value instanceof cheerio;
  }

  export function asPage(value: Type): Page {
    return Page.of({
      document: Document.of(self => [Node.fromNode(toNode(value[0]))])
    });
  }
}

function toNode(cheerioNode: CheerioElement): Node.JSON {
  switch (cheerioNode.type) {
    case "text":
      return toText(cheerioNode);

    default:
      return toElement(cheerioNode);
  }
}

function toElement(cheerioElement: CheerioElement): Element.JSON {
  const { name, attribs, childNodes } = cheerioElement;

  const attributes = keys(attribs).map(localName => {
    return toAttribute(localName, attribs[localName]);
  });

  const children = childNodes.map(toNode);

  return {
    type: "element",
    namespace: Namespace.HTML,
    prefix: null,
    name,
    attributes,
    style: null,
    children,
    shadow: null,
    content: null
  };
}

function toAttribute(name: string, value: string): Attribute.JSON {
  return {
    type: "attribute",
    namespace: null,
    prefix: null,
    name,
    value
  };
}

function toText(cheerioElement: CheerioElement): Text.JSON {
  return {
    type: "text",
    data: cheerioElement.nodeValue
  };
}
