import * as crypto from "@alfa/crypto";

import { Node } from "./types";
import {
  isElement,
  isText,
  isParent,
  isComment,
  isDocumentType
} from "./guards";

const { keys, assign } = Object;

export type WithDigest<T extends Node> = T & Readonly<{ digest: string }>;

export function hasDigest<T extends Node>(node: T): node is WithDigest<T> {
  return "digest" in node;
}

/**
 * Compute and assign digests to a node and all of its children. The digest
 * algorithm is based on DOMHASH (RFC2803) and provides a means of identifying
 * identical subtrees of a DOM structure.
 *
 * @see https://www.ietf.org/rfc/rfc2803.txt
 */
export async function digest<T extends Node>(node: T): Promise<string | null> {
  if (isComment(node) || isDocumentType(node)) {
    return null;
  }

  if (hasDigest(node)) {
    return node.digest;
  }

  let data = String(node.nodeType);

  if (isText(node)) {
    data += node.data;
  }

  if (isElement(node)) {
    data += node.tagName;

    for (const { name, value } of node.attributes.sort(
      (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
    )) {
      data += name + value;
    }
  }

  if (isParent(node)) {
    for (const child of node.childNodes) {
      await digest(child);

      if (hasDigest(child)) {
        data += child.digest;
      }
    }
  }

  const withDigest = assign(node, { digest: await crypto.digest(data) });

  return withDigest.digest;
}
