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

  if (selectorNamespace === undefined) {
    selectorNamespace = null;
  }

  let attributeValue = null;

  if (selectorNamespace === null) {
    attributeValue = getAttributeValue(element, name);
  } else {
    attributeValue = getNSAttributeValue(element, name, selectorNamespace);
  }

  // If attribute is non-existing
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
  element: Element,
  qualifiedName: string
): string | null {
  const { name, namespace } = splitQualifiedName(qualifiedName);
  const attributes = getAttributeMap(element).get(name);

  if (attributes === undefined) {
    return null;
  }

  if (namespace === null) {
    return attributes[0].value;
  }

  for (let i = 0, n = attributes.length; i < n; i++) {
    const { prefix, value } = attributes[i];
    if (prefix === namespace) {
      return value;
    }
  }

  return null;
}

function getNSAttributeValue(
  element: Element,
  name: string,
  selectorNamespace: Namespace | string
): string | null {
  const attributes = getAttributeMap(element).get(name);

  if (attributes === undefined) {
    return null;
  }

  if (selectorNamespace === "*") {
    return attributes[0].value;
  }

  for (let i = 0, n = attributes.length; i < n; i++) {
    const { value } = attributes[i];
    const attributeNamespace = getAttributeNamespace(
      attributes[i],
      element,
      element
    );

    if (attributeNamespace === selectorNamespace) {
      return value;
    }

    if (attributeNamespace === null && selectorNamespace === Namespace.HTML) {
      return value;
    }
  }

  return null;
}

function getAttributeMap(element: Element): Map<string, Array<Attribute>> {
  let attributeMap = attributeMaps.get(element);

  if (attributeMap !== undefined) {
    return attributeMap;
  }

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

  return attributeMap;
}

function splitQualifiedName(
  qualifiedName: string
): { name: string; namespace: string | null } {
  const delimiter = qualifiedName.indexOf(":");

  if (delimiter === -1) {
    return { name: qualifiedName, namespace: null };
  }

  return {
    name: qualifiedName.substring(delimiter + 1),
    namespace: qualifiedName.substring(0, delimiter)
  };
}
