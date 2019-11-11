import {
  Attribute,
  Element,
  Node,
  NodeType,
  Text
} from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";
import * as cheerio from "cheerio";

const { keys } = Object;

export namespace Cheerio {
  export type Type = Cheerio;

  export function isType(value: unknown): value is Type {
    return value instanceof cheerio.default;
  }

  export function asPage(value: Type): Page {
    return Page.of({
      document: {
        nodeType: NodeType.Document,
        styleSheets: [],
        childNodes: [asElement(value[0])]
      }
    });
  }
}

function asNode(cheerioNode: CheerioElement): Node {
  switch (cheerioNode.type) {
    case "text":
      return asText(cheerioNode);

    default:
      return asElement(cheerioNode);
  }
}

function asElement(cheerioElement: CheerioElement): Element {
  const { name: localName, attribs } = cheerioElement;

  const attributes: Array<Attribute> = keys(attribs).map(localName => {
    return asAttribute(localName, attribs[localName]);
  });

  const childNodes: Array<Node> = cheerioElement.childNodes.map(asNode);

  return {
    nodeType: NodeType.Element,
    prefix: null,
    localName,
    attributes,
    shadowRoot: null,
    childNodes
  };
}

function asAttribute(localName: string, value: string): Attribute {
  return {
    nodeType: NodeType.Attribute,
    prefix: null,
    localName,
    value,
    childNodes: []
  };
}

function asText(cheerioElement: CheerioElement): Text {
  return {
    nodeType: NodeType.Text,
    data: cheerioElement.nodeValue,
    childNodes: []
  };
}
