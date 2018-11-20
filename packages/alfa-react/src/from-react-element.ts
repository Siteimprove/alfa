import { Element, NodeType, Text } from "@siteimprove/alfa-dom";
import { keys } from "@siteimprove/alfa-util";
import { ReactElement } from "react";

const { isArray } = Array;

export function fromReactElement<T>(reactElement: ReactElement<T>): Element {
  const { type, props } = reactElement;

  if (typeof type !== "string") {
    throw new Error();
  }

  let childNodes: Array<ReactElement<unknown> | string> = [];

  if ("children" in props) {
    let { children } = props as T & { children: unknown };

    if (!isArray(children)) {
      children = [children];
    }

    childNodes = children as Array<ReactElement<unknown> | string>;
  }

  return {
    nodeType: NodeType.Element,
    localName: type,
    prefix: null,
    attributes: keys(props)
      .filter(name => name !== "children")
      .map(name => ({
        prefix: null,
        localName: name.toString(),
        value: props[name].toString()
      })),
    shadowRoot: null,
    childNodes: childNodes.map(child => {
      if (typeof child === "string") {
        const text: Text = {
          nodeType: NodeType.Text,
          data: child,
          childNodes: []
        };

        return text;
      }

      return fromReactElement(child);
    })
  };
}
