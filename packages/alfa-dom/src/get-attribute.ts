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
  namespace?: Namespace | "*" | null,
  options?: AttributeOptions
): string | Array<string> | null;

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
  selectorNamespace?: Namespace | "*" | null | AttributeOptions,
  options: AttributeOptions = {}
): string | Array<string> | null {
  if (selectorNamespace !== null && typeof selectorNamespace === "object") {
    options = selectorNamespace;
    selectorNamespace = null;
  }

  if (selectorNamespace === undefined) {
    selectorNamespace = null;
  }

  let attributeValue: string | Array<string> | null = null;

  if (selectorNamespace === null) {
    attributeValue = getAttributeValue(element, name);
  } else if (selectorNamespace === "*") {
    attributeValue = getNSWildcardAttributeValue(element, name);
  } else {
    attributeValue = getNSAttributeValue(element, name, selectorNamespace);
  }

  // If attribute does not exist
  if (attributeValue === null) {
    return null;
  }

  if (attributeValue instanceof Array) {
    return attributeValue.map(value => applyOptions(value, options));
  }

  return applyOptions(attributeValue, options);
}

function getAttributeValue(
  element: Element,
  qualifiedName: string
): string | Array<string> | null {
  const { name, namespace } = splitQualifiedName(qualifiedName);
  const attributes = getAttributeMap(element).get(name);

  if (attributes === undefined) {
    return null;
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
  selectorNamespace: Namespace | "*"
): string | null {
  const attributes = getAttributeMap(element).get(name);

  if (attributes === undefined) {
    return null;
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
  }

  return null;
}

function getNSWildcardAttributeValue(
  element: Element,
  name: string
): string | Array<string> | null {
  const attributes = getAttributeMap(element).get(name);

  if (attributes === undefined) {
    return null;
  }

  const values: Array<string> = [];

  for (let i = 0, n = attributes.length; i < n; i++) {
    values.push(attributes[i].value);
  }

  if (values.length === 1) {
    return values[0];
  }

  return values;
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

function applyOptions(value: string, options: AttributeOptions): string {
  if (options.trim === true) {
    value = value.trim();
  }

  if (options.lowerCase === true) {
    value = value.toLowerCase();
  }

  return value;
}

function splitQualifiedName(
  qualifiedName: string
): { name: string; namespace: string | null } {
  const delimiter = qualifiedName.indexOf(":");

  if (delimiter === -1) {
    return { name: qualifiedName, namespace: null };
  }

  const name = qualifiedName.substring(delimiter + 1);
  const namespace = qualifiedName.substring(0, delimiter);

  if (namespace === "*") {
    return { name: qualifiedName, namespace: null };
  }

  return { name, namespace };
}
