/// <reference path="./types/nodes.d.ts"/>
/// <reference path="./types/intrinsics.d.ts"/>

import { set } from "@alfa/util";

const { keys } = Object;

export function jsx(
  localName: string,
  attributes: { [name: string]: any } | null,
  ...childNodes: Array<JSX.Element | string>
): JSX.Element {
  const element: JSX.Element = {
    nodeType: 1,
    childNodes: childNodes.map(
      childNode =>
        typeof childNode === "string"
          ? { nodeType: 3, childNodes: [], data: childNode }
          : childNode
    ),
    namespaceURI: "http://www.w3.org/1999/xhtml",
    prefix: null,
    localName,
    attributes:
      attributes === null
        ? []
        : keys(attributes)
            .filter(name => {
              const value = attributes[name];
              return value !== false && value !== null && value !== undefined;
            })
            .map(name => {
              const value = attributes[name];
              return {
                namespaceURI: null,
                prefix: null,
                localName: name,
                value:
                  typeof value === "number"
                    ? value.toString(10)
                    : typeof value === "boolean"
                      ? name
                      : typeof value === "string"
                        ? value
                        : value.toString()
              };
            }),
    shadowRoot: null
  };

  if (localName === "svg") {
    setNamespace(element, "http://www.w3.org/2000/svg");
  }

  if (localName === "math") {
    setNamespace(element, "http://www.w3.org/1998/Math/MathML");
  }

  return element;
}

function isElement(node: JSX.Node): node is JSX.Element {
  return node.nodeType === 1;
}

function setNamespace(node: JSX.Node, namespaceURI: string): void {
  if (isElement(node)) {
    set(node, "namespaceURI", namespaceURI);
  }

  node.childNodes.forEach(childNode => {
    setNamespace(childNode, namespaceURI);
  });
}
