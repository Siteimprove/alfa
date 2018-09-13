import { Attribute, Element, ShadowRoot, Text } from "./types";
import * as Types from "./types";

const { keys } = Object;

export function jsx(
  type: string,
  properties?: {
    [name: string]: string | number | boolean | object | null | undefined;
  } | null,
  ...children: Array<Element | string>
): Element {
  if (properties === undefined || properties === null) {
    properties = {};
  }

  const childNodes: Array<Element | Text> = [];

  let shadowRoot: ShadowRoot | null = null;

  for (let i = 0, n = children.length; i < n; i++) {
    const child = children[i];

    if (typeof child === "string") {
      childNodes.push({ nodeType: 3, childNodes: [], data: child });
    } else {
      // We use the first <shadow> element as a mount point for a shadow root.
      // Since the <shadow> is now obsolete and therefore isn'be needed for
      // anything else we can safely make use of it for this purpose.
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/shadow
      if (shadowRoot === null && child.localName === "shadow") {
        shadowRoot = {
          nodeType: 11,
          mode: "open",
          childNodes: child.childNodes
        };
      } else {
        childNodes.push(child);
      }
    }
  }

  const attributes: Array<Attribute> = [];

  const propertyNames = keys(properties);

  for (let i = 0, n = propertyNames.length; i < n; i++) {
    const name = propertyNames[i];
    const value = properties[name];

    if (value !== false && value !== null && value !== undefined) {
      attributes.push({
        prefix: null,
        localName: name,
        value: toString(name, value)
      });
    }
  }

  return {
    nodeType: 1,
    prefix: null,
    localName: type,
    attributes,
    shadowRoot,
    childNodes
  };
}

export namespace jsx {
  export namespace JSX {
    export interface IntrinsicElements {
      [tag: string]:
        | {}
        | Readonly<{
            [attribute: string]:
              | string
              | number
              | boolean
              | object
              | null
              | undefined;
          }>;
    }

    export import Element = Types.Element;
  }
}

function toString(
  name: string,
  value: string | number | boolean | object
): string {
  return typeof value === "number"
    ? value.toString(10)
    : typeof value === "boolean"
      ? name
      : typeof value === "string"
        ? value
        : value.toString();
}
