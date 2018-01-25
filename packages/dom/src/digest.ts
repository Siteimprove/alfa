import SHA from "jssha";

import { Node } from "./types";
import {
  isElement,
  isText,
  isParent,
  isComment,
  isDocumentType
} from "./guards";

const { keys, assign } = Object;

export type WithDigest<T extends Node> = T & { readonly digest: string };

export function hasDigest<T extends Node>(node: T): node is WithDigest<T> {
  return "digest" in node;
}

/**
 * @see https://www.ietf.org/rfc/rfc2803.txt
 */
export function digest<T extends Node>(node: T): WithDigest<T> | Node {
  if (hasDigest(node) || isComment(node) || isDocumentType(node)) {
    return node;
  }

  const sha = new SHA("SHA-256", "TEXT");

  sha.update(node.type);

  if (isText(node)) {
    sha.update(node.value);
  }

  if (isElement(node)) {
    sha.update(node.tag);

    for (const name of keys(node.attributes).sort()) {
      const value = node.attributes[name];

      sha.update(name);
      sha.update(String(value));
    }
  }

  if (isParent(node)) {
    for (const child of node.children) {
      digest(child);

      if (hasDigest(child)) {
        sha.update(child.digest);
      }
    }
  }

  return assign(node, { digest: sha.getHash("B64") });
}
