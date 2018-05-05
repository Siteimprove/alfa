import { slice, each } from "@alfa/util";
import * as crypto from "@alfa/crypto";

import { Node } from "./types";
import { isElement, isText, isComment, isDocumentType } from "./guards";

const digests: WeakMap<Node, string> = new WeakMap();

/**
 * Compute the digest of a node. The digest algorithm is based on DOMHASH
 * (RFC2803) and provides a means of identifying identical subtrees of a DOM
 * structure.
 *
 * @see https://www.ietf.org/rfc/rfc2803.txt
 */
export async function getDigest(node: Node): Promise<string | null> {
  if (isComment(node) || isDocumentType(node)) {
    return null;
  }

  let digest = digests.get(node);

  if (digest === undefined) {
    digest = String(node.nodeType);

    if (isText(node)) {
      digest += node.data;
    }

    if (isElement(node)) {
      if (node.namespaceURI === null) {
        digest += node.localName;
      } else {
        digest += node.namespaceURI + ":" + node.localName;
      }

      const attributes = slice(node.attributes).sort(
        (a, b) =>
          a.localName > b.localName ? 1 : a.localName < b.localName ? -1 : 0
      );

      each(attributes, attribute => {
        if (attribute.namespaceURI === null) {
          digest += attribute.localName + attribute.value;
        } else {
          digest +=
            attribute.namespaceURI +
            ":" +
            attribute.localName +
            attribute.value;
        }
      });
    }

    for (let i = 0, n = node.childNodes.length; i < n; i++) {
      const child = node.childNodes[i];
      const childDigest = await getDigest(child);

      if (childDigest !== null) {
        digest += childDigest;
      }
    }

    digest = await crypto.digest(digest);
    digests.set(node, digest);
  }

  return digest;
}
