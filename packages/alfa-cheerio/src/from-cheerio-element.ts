import { Attribute, Element, NodeType, Text } from "@siteimprove/alfa-dom";
import { CheerioElement } from "./types";

const { keys } = Object;

export function fromCheerioElement<T>(cheerioElement: CheerioElement): Element {
  return convertElement(cheerioElement[0]);
}

function convertElement(cheerioElement: CheerioElement[0]): Element {
  const { name: localName, attribs, childNodes: children } = cheerioElement;

  const attributes: Array<Attribute> = keys(attribs).map(localName => {
    return {
      nodeType: NodeType.Attribute,
      prefix: null,
      localName,
      value: attribs[localName],
      childNodes: []
    };
  });

  const childNodes: Array<Element | Text> = children.map(childNode => {
    if (childNode.type === "text") {
      return {
        nodeType: NodeType.Text,
        data: childNode.data!,
        childNodes: []
      };
    }

    return convertElement(childNode);
  });

  return {
    nodeType: NodeType.Element,
    prefix: null,
    localName,
    attributes,
    shadowRoot: null,
    childNodes
  };
}
