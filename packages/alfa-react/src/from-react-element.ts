import { Attribute, Element, NodeType, Text } from "@siteimprove/alfa-dom";
import { keys } from "@siteimprove/alfa-util";
import { ReactElement } from "react";
import * as TestRenderer from "react-test-renderer";

export function fromReactElement<T>(reactElement: ReactElement<T>): Element {
  const tree = TestRenderer.create(reactElement).toJSON();

  if (tree === null) {
    throw new Error("Could not render React element");
  }

  return convertTree(tree);
}

function convertTree(tree: TestRenderer.ReactTestRendererJSON): Element {
  const { type: localName, props, children } = tree;

  const attributes: Array<Attribute> = keys(props).map(localName => {
    return {
      nodeType: NodeType.Attribute,
      prefix: null,
      localName: String(localName),
      value: props[localName],
      childNodes: []
    };
  });

  const childNodes: Array<Element | Text> =
    children === null
      ? []
      : children.map(child => {
          if (typeof child === "string") {
            return {
              nodeType: NodeType.Text,
              data: child,
              childNodes: []
            };
          }

          return convertTree(child);
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
