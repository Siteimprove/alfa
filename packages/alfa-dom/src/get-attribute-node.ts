import { getAttributeNamespace } from "./get-attribute-namespace";
import { Attribute, Element, Namespace, Node } from "./types";

const { isArray } = Array;

const attributeMaps: WeakMap<
  Element,
  Map<string, Attribute | Array<Attribute>>
> = new WeakMap();

export function getAttributeNode(
  element: Element,
  qualifiedName: string
): Attribute | null;

export function getAttributeNode(
  element: Element,
  context: Node,
  localName: string,
  namespace: Namespace | null
): Attribute | null;

export function getAttributeNode(
  element: Element,
  context: Node,
  localName: string,
  namespace: "*"
): Array<Attribute> | null;

export function getAttributeNode(
  element: Element,
  context: Node | string,
  name?: string,
  namespace?: Namespace | "*" | null
): Attribute | Array<Attribute> | null {
  if (namespace === undefined) {
    name = context as string;
  }

  const attributeMap = getAttributeMap(element);

  // If no namespace has been specified, we're dealing with a qualified name.
  if (namespace === undefined) {
    const qualifiedName = name as string;

    const split = splitQualifiedName(qualifiedName);

    const { localName } = split;
    let { prefix } = split;

    // We first look up the attribute based on the qualified name treated as a
    // local name. Local names take presedence over qualifed names to ensure
    // that the following case works:
    //
    //   <div foo:bar="baz" bar="baz">
    //
    // In the above, if we asked for the "foo:bar" attribute, we would expect
    // the first attribute to be returned. If we first did a lookup of a local
    // name of "bar", we would however get the second attribute and determine
    // that it did not match the prefix of "foo" and therefore return `null`
    // rather than the "foo:bar" attribute.
    let attribute = attributeMap.get(qualifiedName);

    // If no attribute with the given qualified name was found, we look up the
    // attribute based on the local name.
    if (attribute === undefined) {
      attribute = attributeMap.get(localName);

      // If that also didn't provide a result, no attribute exists.
      if (attribute === undefined) {
        return null;
      }
    } else {
      // In case the qualified name did provide a result, forget the prefix.
      prefix = null;
    }

    const candidates = isArray(attribute) ? attribute : [attribute];

    // Look for a candidate that matches the passed prefix.
    for (let i = 0, n = candidates.length; i < n; i++) {
      const candidate = candidates[i];

      if (candidate.prefix === prefix) {
        return candidate;
      }
    }
  }

  // Otherwise, we're dealing with a local name and a namespace.
  else {
    context = context as Node;

    const localName = name as string;

    const attribute = attributeMap.get(localName);

    // If no attribute with the given local name was found, no attribute exists.
    if (attribute === undefined) {
      return null;
    }

    const candidates = isArray(attribute) ? attribute : [attribute];

    // If the wildcard namespace is passed, return all candidates.
    if (namespace === "*") {
      return candidates;
    }

    // Otherwise, look for a candidate that matches the passed namespace.
    for (let i = 0, n = candidates.length; i < n; i++) {
      const candidate = candidates[i];

      if (getAttributeNamespace(candidate, context) === namespace) {
        return candidate;
      }
    }
  }

  return null;
}

function getAttributeMap(
  element: Element
): Map<string, Attribute | Array<Attribute>> {
  let attributeMap = attributeMaps.get(element);

  if (attributeMap === undefined) {
    attributeMap = new Map();

    const { attributes } = element;

    for (let i = 0, n = attributes.length; i < n; i++) {
      const attribute = attributes[i];
      const { localName } = attribute;

      if (attributeMap.has(localName)) {
        const attributes = attributeMap.get(localName)!;

        if (isArray(attributes)) {
          attributes.push(attribute);
        } else {
          attributeMap.set(localName, [attributes, attribute]);
        }
      } else {
        attributeMap.set(localName, attribute);
      }
    }

    attributeMaps.set(element, attributeMap);
  }

  return attributeMap;
}

function splitQualifiedName(
  qualifiedName: string
): { localName: string; prefix: string | null } {
  const delimiter = qualifiedName.indexOf(":");

  if (delimiter === -1) {
    return { localName: qualifiedName, prefix: null };
  }

  const prefix = qualifiedName.substring(0, delimiter);
  const localName = qualifiedName.substring(delimiter + 1);

  // We explicitly don't support using wildcards when specifying qualified names
  // as this syntax is only valid when used in selectors.
  if (prefix === "*") {
    return { localName: qualifiedName, prefix: null };
  }

  return { localName, prefix };
}
