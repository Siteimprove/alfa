import { Algorithm, Encoding, getHash } from "@siteimprove/alfa-crypto";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { getAttributeNamespace } from "./get-attribute-namespace";
import { getChildNodes } from "./get-child-nodes";
import { getElementNamespace } from "./get-element-namespace";
import { isComment, isDocumentType, isElement, isText } from "./guards";
import { Attribute, Element, Node } from "./types";

/**
 * Given a node and a context, compute the digest of the node within the
 * context. The digest algorithm is based on DOMHASH (RFC 2803) and provides a
 * means of identifying identical subtrees of a DOM structure. If no digest can
 * be computed for the node then `null` is returned.
 *
 * Filters can be supplied for leaving out pieces of information when computing
 * digests. If, for example, certain ephemeral attributes are added to elements,
 * such as auto generated IDs or timestamps, then these can be ignored when
 * computing digests by supplying an attribute filter.
 *
 * @see https://tools.ietf.org/html/rfc2803
 */
export function getDigest(
  node: Node,
  context: Node,
  options: getDigest.Options = {}
): Option<string> {
  if (isComment(node) || isDocumentType(node)) {
    return None;
  }

  const { algorithm = "sha256", encoding = "base64", filters = {} } = options;

  if (filters.node !== undefined && !filters.node(node, context)) {
    return None;
  }

  const hash = getHash(algorithm);

  hash.update(node.nodeType.toString(10));

  if (isText(node)) {
    hash.update(node.data);
  }

  if (isElement(node)) {
    const namespace = getElementNamespace(node, context);

    if (namespace.isSome()) {
      hash.update(`${namespace.get()}:${node.localName}`);
    } else {
      hash.update(node.localName);
    }

    hash.update("\u{0000}");

    const attributes = Array.from(node.attributes).sort((a, b) =>
      a.localName > b.localName ? 1 : a.localName < b.localName ? -1 : 0
    );

    const attributeDigests: Array<string> = [];

    for (let i = 0, n = attributes.length; i < n; i++) {
      const attribute = attributes[i];

      if (attribute.localName === "xmlns" || attribute.prefix === "xmlns") {
        continue;
      }

      if (
        filters.attribute !== undefined &&
        filters.attribute(attribute, node, context) === false
      ) {
        continue;
      }

      const namespace = getAttributeNamespace(attribute, context);

      const value = `${attribute.localName}\u{0000}${attribute.value}`;

      if (namespace.isSome()) {
        attributeDigests.push(`${namespace.get()}:${value}`);
      } else {
        attributeDigests.push(value);
      }
    }

    hash.update(attributeDigests.length.toString(10));

    for (let i = 0, n = attributeDigests.length; i < n; i++) {
      hash.update(attributeDigests[i]);
    }
  }

  const childDigests: Array<string> = [];

  for (const childNode of getChildNodes(node, context, options)) {
    const childDigest = getDigest(childNode, context, options);

    if (childDigest.isSome()) {
      childDigests.push(childDigest.get());
    }
  }

  hash.update(childDigests.length.toString(10));

  for (let i = 0, n = childDigests.length; i < n; i++) {
    hash.update(childDigests[i]);
  }

  return Some.of(hash.digest(encoding));
}

export namespace getDigest {
  export interface Options extends getChildNodes.Options {
    readonly algorithm?: Algorithm;
    readonly encoding?: Encoding;
    readonly filters?: Filters;
  }

  export interface Filters {
    readonly node?: NodeFilter;
    readonly attribute?: AttributeFilter;
  }

  /**
   * Given a node and a context, determine whether or not the node should be
   * part of the digest being computed.
   */
  export type NodeFilter = (node: Node, context: Node) => boolean;

  /**
   * Given an attribute, the element that the attribute belongs to, and a
   * context, determine whether or not the attribute should be part of the
   * digest being computed.
   */
  export type AttributeFilter = (
    attribute: Attribute,
    owner: Element,
    context: Node
  ) => boolean;
}
