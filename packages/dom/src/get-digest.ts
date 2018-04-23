import * as crypto from "@alfa/crypto";

import { Node } from "./types";
import {
  isElement,
  isText,
  isParent,
  isComment,
  isDocumentType
} from "./guards";

const digests: WeakMap<Node, string> = new WeakMap();

/**
 * Compute the digest of a node. The digest algorithm is based on DOMHASH
 * (RFC2803) and provides a means of identifying identical subtrees of a DOM
 * structure.
 *
 * @see https://www.ietf.org/rfc/rfc2803.txt
 */
export async function getDigest<T extends Node>(
  node: T
): Promise<string | null> {
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
      digest += node.tagName;

      for (const { name, value } of node.attributes.sort(
        (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
      )) {
        digest += name + value;
      }
    }

    if (isParent(node)) {
      for (const child of node.childNodes) {
        const childDigest = await getDigest(child);

        if (childDigest !== null) {
          digest += childDigest;
        }
      }
    }

    digest = await crypto.digest(digest);
    digests.set(node, digest);
  }

  return digest;
}
