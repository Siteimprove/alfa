import { Cache } from "@siteimprove/alfa-cache";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { getAttributeNamespace } from "./get-attribute-namespace";
import { Attribute, Element, Namespace, Node } from "./types";

const cache = Cache.empty<Element, Cache<string, Iterable<Attribute>>>();

/**
 * @see https://dom.spec.whatwg.org/#dom-element-getattributenode
 */
export function getAttributeNode(
  element: Element,
  context: Node,
  qualifiedName: string
): Option<Attribute>;

/**
 * @see https://dom.spec.whatwg.org/#dom-element-getattributenodens
 */
export function getAttributeNode(
  element: Element,
  context: Node,
  localName: string,
  namespace: Namespace
): Option<Attribute>;

export function getAttributeNode(
  element: Element,
  context: Node,
  localName: string,
  namespace: "*"
): Option<Iterable<Attribute>>;

export function getAttributeNode(
  element: Element,
  context: Node,
  name: string,
  namespace?: Namespace | "*"
): Option<Attribute> | Option<Iterable<Attribute>> {
  const attributeNodes = cache.get(element, () => {
    const attributeNodes = Cache.empty<string, Array<Attribute>>(
      Cache.Type.Strong
    );

    for (const attribute of Iterable.from(element.attributes)) {
      attributeNodes.get(attribute.localName, () => []).push(attribute);
    }

    return attributeNodes;
  });

  // If a namespace has been specified, we're dealing with a local name and a
  // namespace.
  if (namespace !== undefined) {
    const attributes = attributeNodes.get(name);

    if (namespace === "*") {
      return attributes;
    }

    return attributes.flatMap(attributes =>
      Iterable.find(attributes, attribute =>
        getAttributeNamespace(attribute, context).includes(namespace)
      )
    );
  }

  // Otherwise, we're dealing with a qualified name.
  const split = splitQualifiedName(name);

  const { localName } = split;
  let { prefix } = split;

  // We first look up the attribute based on the qualified name treated as a
  // local name. Local names take presedence over qualifed names to ensure that
  // the following case works:
  //
  //   <div foo:bar="baz" bar="baz">
  //
  // In the above, if we asked for the "foo:bar" attribute, we would expect the
  // first attribute to be returned. If we first did a lookup of a local name of
  // "bar", we would however get the second attribute and determine that it did
  // not match the prefix of "foo" and therefore return none rather than the
  // "foo:bar" attribute.
  let attributes = attributeNodes.get(name);

  // If no attribute with the given qualified name was found, we look up the
  // attribute based on the local name.
  if (attributes.isNone()) {
    attributes = attributeNodes.get(localName);

    // If that also didn't provide a result, no attribute exists.
    if (attributes.isNone()) {
      return None;
    }
  } else {
    // In case the qualified name did provide a result, forget the prefix.
    prefix = null;
  }

  return attributes.flatMap(attributes =>
    Iterable.find(attributes, attribute => attribute.prefix === prefix)
  );
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
