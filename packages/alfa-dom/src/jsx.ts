import { Attribute, Document, Element, ShadowRoot, Text } from "./types";
import * as t from "./types";

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

  let contentDocument: Document | null | undefined =
    type === "iframe" || type === "object" ? null : undefined;

  for (let i = 0, n = children.length; i < n; i++) {
    const child = children[i];

    if (typeof child === "string") {
      childNodes.push({ nodeType: 3, childNodes: [], data: child });
    } else {
      // We use the first <shadow> and <content> elements as a mount points for
      // shadow roots and nested content documents, respectively.  Since both
      // the <shadow> and <content> elements are now obsolete and therefore
      // aren't needed for anything else we can safely make use of them for this
      // purpose.
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/shadow
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/content
      if (shadowRoot === null && child.localName === "shadow") {
        shadowRoot = {
          nodeType: 11,
          mode: "open",
          childNodes: child.childNodes
        };
      } else if (contentDocument === null && child.localName === "content") {
        contentDocument = {
          nodeType: 9,
          childNodes: child.childNodes,
          styleSheets: []
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
        nodeType: 2,
        prefix: null,
        localName: name,
        value: toString(name, value),
        childNodes: []
      });
    }
  }

  return {
    nodeType: 1,
    prefix: null,
    localName: type,
    attributes,
    shadowRoot,
    childNodes,
    ...(contentDocument === undefined ? null : { contentDocument })
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

    export import Element = t.Element;
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
