import { getAttributeNamespace } from "./get-attribute-namespace";
import { Attribute, Element, Namespace } from "./types";

export interface AttributeOptions {
  readonly trim?: boolean;
  readonly lowerCase?: boolean;
}

const attributeMaps: WeakMap<
  Element,
  Map<string, Array<Attribute>>
> = new WeakMap();

export function getAttribute(
  element: Element,
  qualifiedName: string,
  options?: AttributeOptions
): string | null;

export function getAttribute(
  element: Element,
  localName: string,
  namespace?: Namespace | string | null,
  options?: AttributeOptions
): string | null;

/**
 * Given an element, get the value of the given attribute name of the element.
 * If the element does not have an attribute with the given name then `null` is
 * returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-element-getattribute
 *
 * @example
 * const div = <div title="Foo" />;
 * getAttribute(div, "title");
 * // => "Foo"
 */
export function getAttribute(
  element: Element,
  name: string,
  selectorNamespace?: Namespace | string | null | AttributeOptions,
  options: AttributeOptions = {}
): string | null {
  if (selectorNamespace !== null && typeof selectorNamespace === "object") {
    options = selectorNamespace;
    selectorNamespace = null;
  }

  let attributeMap = attributeMaps.get(element);

  if (attributeMap === undefined) {
    attributeMap = new Map();

    const { attributes } = element;

    for (let i = 0, n = attributes.length; i < n; i++) {
      const attribute = attributes[i];
      const { localName } = attribute;

      let attributeArray = attributeMap.get(localName);

      if (attributeArray === undefined) {
        attributeArray = [];
      }

      attributeArray.push(attribute);

      attributeMap.set(localName, attributeArray);
    }

    attributeMaps.set(element, attributeMap);
  }

  let attributeValue = null;

  if (selectorNamespace !== null && selectorNamespace !== undefined) {
    attributeValue = getNSAttributeValue(
      element,
      attributeMap,
      name,
      selectorNamespace
    );
  } else {
    attributeValue = getAttributeValue(attributeMap, name);
  }

  if (attributeValue === null) {
    return null;
  }

  if (options.trim === true) {
    attributeValue = attributeValue.trim();
  }

  if (options.lowerCase === true) {
    attributeValue = attributeValue.toLowerCase();
  }

  return attributeValue;
}

function getAttributeValue(
  attributeMap: Map<string, Array<Attribute>>,
  qualifiedName: string
): string | null {
  const [attrName, attrNamespace] = splitQualifiedName(qualifiedName);

  const attributes = attributeMap.get(attrName);
  if (attributes === undefined) {
    return null;
  }

  let attributeValue = null;

  for (let i = 0, n = attributes.length; i < n; i++) {
    const { prefix, value } = attributes[i];

    if (attrNamespace !== null) {
      if (prefix === attrNamespace) {
        attributeValue = value;
        break;
      }
      continue;
    }

    attributeValue = value;
  }

  return attributeValue;
}

function getNSAttributeValue(
  element: Element,
  attributeMap: Map<string, Array<Attribute>>,
  name: string,
  selectorNamespace: Namespace | string
): string | null {
  const attributes = attributeMap.get(name);
  if (attributes === undefined) {
    return null;
  }

  let attributeValue = null;

  for (let i = 0, n = attributes.length; i < n; i++) {
    const { value } = attributes[i];

    if (selectorNamespace === "*") {
      attributeValue = value;
      break;
    }

    const ns = getAttributeNamespace(attributes[i], element, element);

    if (ns === null && selectorNamespace === Namespace.HTML) {
      attributeValue = value;
      break;
    }

    if (ns === selectorNamespace) {
      attributeValue = value;
      break;
    }
  }

  return attributeValue;
}

function splitQualifiedName(qualifiedName: string): [string, string | null] {
  let name = null;
  let namespace = null;

  const commaPos = qualifiedName.indexOf(":");
  if (commaPos !== -1) {
    name = qualifiedName.substring(commaPos + 1);
    namespace = qualifiedName.substring(0, commaPos);
  } else {
    name = qualifiedName;
  }

  return [name, namespace];
}
