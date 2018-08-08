import { getHash } from "@siteimprove/alfa-crypto";
import { getAttributeNamespace } from "./get-attribute-namespace";
import { getChildNodes } from "./get-child-nodes";
import { getElementNamespace } from "./get-element-namespace";
import { isComment, isDocumentType, isElement, isText } from "./guards";
import { Attribute, Element, Node } from "./types";

/**
 * Given a node and a context, determine whether or not the node should be part
 * of the digest being computed.
 */
export type NodeFilter = (node: Node, context: Node) => boolean;

/**
 * Given an attribute, the element that the attribute belongs to, and a context,
 * determine whether or not the attribute should be part of the digest being
 * computed.
 */
export type AttributeFilter = (
  attribute: Attribute,
  element: Element,
  context: Node
) => boolean;

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
  options: Readonly<{
    composed?: boolean;
    flattened?: boolean;
    filters?: Readonly<{ node?: NodeFilter; attribute?: AttributeFilter }>;
  }> = {}
): string | null {
  if (isComment(node) || isDocumentType(node)) {
    return null;
  }

  const { filters = {} } = options;

  if (filters.node !== undefined && !filters.node(node, context)) {
    return null;
  }

  const hash = getHash("sha256");

  hash.update(String(node.nodeType));

  if (isText(node)) {
    hash.update(node.data);
  }

  if (isElement(node)) {
    const namespace = getElementNamespace(node, context);

    if (namespace === null) {
      hash.update(node.localName);
    } else {
      hash.update(`${namespace}:${node.localName}`);
    }

    const attributes = Array.from(node.attributes).sort(
      (a, b) =>
        a.localName > b.localName ? 1 : a.localName < b.localName ? -1 : 0
    );

    for (const attribute of attributes) {
      if (
        filters.attribute !== undefined &&
        !filters.attribute(attribute, node, context)
      ) {
        continue;
      }

      const namespace = getAttributeNamespace(attribute, node, context);

      if (namespace === null) {
        hash.update(`${attribute.localName}${attribute.value}`);
      } else {
        hash.update(`${namespace}:${attribute.localName}${attribute.value}`);
      }
    }
  }

  const childNodes = getChildNodes(node, context, options);

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const childDigest = getDigest(childNodes[i], context, options);

    if (childDigest !== null) {
      hash.update(childDigest);
    }
  }

  return hash.digest("base64");
}
