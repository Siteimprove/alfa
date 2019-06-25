import { Attribute, Element, isElement, NodeType } from "@siteimprove/alfa-dom";
import { Expression } from "estree"; // tslint:disable-line
import { JSXAttribute, JSXElement } from "./types";

const elementMap = new WeakMap<Element, JSXElement>();
const attributeMap = new WeakMap<Attribute, JSXAttribute>();

export function fromJsxElement(jsxElement: JSXElement): Element | null {
  const { openingElement } = jsxElement;
  const { name } = openingElement;

  let prefix: string | null = null;
  let localName: string;

  switch (name.type) {
    case "JSXIdentifier":
      if (!/^[a-z]/.test(name.name)) {
        return null;
      }

      localName = name.name.toLowerCase();
      break;

    case "JSXNamespacedName":
      prefix = name.namespace.name.toLowerCase();
      localName = name.name.name.toLowerCase();
      break;

    default:
      return null;
  }

  const attributes: Array<Attribute> = [];

  for (const jsxAttribute of openingElement.attributes) {
    switch (jsxAttribute.type) {
      case "JSXAttribute":
        const { name } = jsxAttribute;

        let prefix: string | null = null;
        let localName: string;

        switch (name.type) {
          case "JSXIdentifier":
            localName = name.name.toLowerCase();
            break;

          case "JSXNamespacedName":
            prefix = name.namespace.name.toLowerCase();
            localName = name.name.name.toLowerCase();
            break;

          default:
            return null;
        }

        let value: string | null;

        if (jsxAttribute.value === null) {
          value = "";
        } else {
          switch (jsxAttribute.value.type) {
            case "Literal":
              value = getValue(jsxAttribute.value);
              break;

            case "JSXExpressionContainer":
              value = getValue(jsxAttribute.value.expression);
              break;

            default:
              continue;
          }
        }

        if (value !== null) {
          const attribute: Attribute = {
            nodeType: 2,
            prefix,
            localName,
            value,
            childNodes: []
          };

          attributeMap.set(attribute, jsxAttribute);

          attributes.push(attribute);
        }
        break;

      case "JSXSpreadAttribute":
    }
  }

  const element: Element = {
    nodeType: NodeType.Element,
    prefix,
    localName,
    attributes,
    shadowRoot: null,
    childNodes: []
  };

  elementMap.set(element, jsxElement);

  return element;
}

export function getNode(element: Element): JSXElement | null;

export function getNode(attribute: Attribute): JSXAttribute | null;

export function getNode(
  node: Element | Attribute
): JSXElement | JSXAttribute | null;

export function getNode(
  node: Element | Attribute
): JSXElement | JSXAttribute | null {
  let result: JSXElement | JSXAttribute | undefined;

  if (isElement(node)) {
    result = elementMap.get(node);
  } else {
    result = attributeMap.get(node);
  }

  if (result === undefined) {
    return null;
  }

  return result;
}

function getValue(expression: Expression): string | null {
  switch (expression.type) {
    case "Literal":
      const { value } = expression;

      return value === undefined
        ? null
        : value === null
        ? "null"
        : value.toString();
  }

  return null;
}
