import { getHash } from "@siteimprove/alfa-crypto";
import { Node } from "./types";
import { isElement, isText, isComment, isDocumentType } from "./guards";
import { getNamespace } from "./get-namespace";

const digests: WeakMap<Node, string> = new WeakMap();

/**
 * Compute the digest of a node. The digest algorithm is based on DOMHASH
 * (RFC2803) and provides a means of identifying identical subtrees of a DOM
 * structure.
 *
 * @see https://www.ietf.org/rfc/rfc2803.txt
 */
export function getDigest(node: Node, context: Node = node): string | null {
  if (isComment(node) || isDocumentType(node)) {
    return null;
  }

  let digest = digests.get(node);

  if (digest === undefined) {
    let hash = getHash("sha256");

    hash.update(String(node.nodeType));

    if (isText(node)) {
      hash.update(node.data);
    }

    if (isElement(node)) {
      const namespace = getNamespace(node, context);

      if (namespace === null) {
        hash.update(node.localName);
      } else {
        hash.update(namespace + ":" + node.localName);
      }

      const attributes = Array.from(node.attributes).sort(
        (a, b) =>
          a.localName > b.localName ? 1 : a.localName < b.localName ? -1 : 0
      );

      for (const attribute of attributes) {
        const namespace = getNamespace(attribute, context);

        if (namespace === null) {
          hash.update(attribute.localName + attribute.value);
        } else {
          hash.update(namespace + ":" + attribute.localName + attribute.value);
        }
      }
    }

    const { childNodes } = node;

    for (let i = 0, n = childNodes.length; i < n; i++) {
      const childDigest = getDigest(childNodes[i], context);

      if (childDigest !== null) {
        hash.update(childDigest);
      }
    }

    digest = hash.digest("base64");
    digests.set(node, digest);
  }

  return digest;
}
