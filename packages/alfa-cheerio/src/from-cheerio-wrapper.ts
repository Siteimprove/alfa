import {
  Attribute,
  Element,
  Node,
  NodeType,
  Text
} from "@siteimprove/alfa-dom";
import { CheerioElement, CheerioWrapper } from "./types";

const { keys } = Object;

export function fromCheerioWrapper<T>(cheerioWrapper: CheerioWrapper): Element {
  return asElement(cheerioWrapper[0]);
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
