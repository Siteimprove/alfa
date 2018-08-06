import { getHash } from "@siteimprove/alfa-crypto";
import { getAttributeNamespace } from "./get-attribute-namespace";
import { getElementNamespace } from "./get-element-namespace";
import { isComment, isDocumentType, isElement, isText } from "./guards";
import { Attribute, Element, Node } from "./types";

const digests: WeakMap<Node, string> = new WeakMap();

export type NodeFilter = (node: Node, context: Node) => boolean;

export type AttributeFilter = (
  attribute: Attribute,
  element: Element,
  context: Node
) => boolean;

/**
 * Given a node and a context, compute the digest of the node within the
 * context. The digest algorithm is based on DOMHASH (RFC2803) and provides a
 * means of identifying identical subtrees of a DOM structure. If no digest can
 * be computed for the node then `null` is returned.
 *
 * @see https://www.ietf.org/rfc/rfc2803.txt
 */
export function getDigest(
  node: Node,
  context: Node,
  filters: Readonly<{ node?: NodeFilter; attribute?: AttributeFilter }> = {}
): string | null {
  if (isComment(node) || isDocumentType(node)) {
    return null;
  }

  if (filters.node !== undefined && !filters.node(node, context)) {
    return null;
  }

  let digest = digests.get(node);

  if (digest === undefined) {
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

    const { childNodes } = node;

    for (let i = 0, n = childNodes.length; i < n; i++) {
      const childDigest = getDigest(childNodes[i], context, filters);

      if (childDigest !== null) {
        hash.update(childDigest);
      }
    }

    digest = hash.digest("base64");
    digests.set(node, digest);
  }

  return digest;
}
