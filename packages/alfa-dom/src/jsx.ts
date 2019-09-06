import {
  Attribute,
  Document,
  Element,
  NodeType,
  ShadowRoot,
  Text
} from "./types";
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
      childNodes.push({
        nodeType: NodeType.Text,
        childNodes: [],
        data: child
      });
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
          nodeType: NodeType.DocumentFragment,
          mode: "open",
          childNodes: child.childNodes
        };
      } else if (contentDocument === null && child.localName === "content") {
        contentDocument = {
          nodeType: NodeType.Document,
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
        nodeType: NodeType.Attribute,
        prefix: null,
        localName: name,
        value: toString(name, value),
        childNodes: []
      });
    }
  }

  return {
    nodeType: NodeType.Element,
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
        | {
            readonly [attribute: string]:
              | string
              | number
              | boolean
              | object
              | null
              | undefined;
          };
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
