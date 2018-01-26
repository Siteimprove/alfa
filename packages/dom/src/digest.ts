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

  let data = node.type;

  if (isText(node)) {
    data += node.value;
  }

  if (isElement(node)) {
    data += node.tag;

    for (const name of keys(node.attributes).sort()) {
      const value = node.attributes[name];

      // A false value indicates that the attribute is non-present per the HTML5
      // spec, so we can skip it altogether. Likewise, we are not interested in
      // attributes with undefined values.
      // https://www.w3.org/TR/html5/infrastructure.html#sec-boolean-attributes
      if (value === false || value === undefined) {
        continue;
      }

      data += name;

      // For boolean attributes, we must repeat the name of the attribute in
      // order to prevent the case were two consecutive boolean attributes in
      // sorted order would otherwise hash to the same value as an attribute
      // with a name of the first attribute and a value of the second:
      //
      //   <div bar foo /> = <div bar="foo" />
      //
      // We also cannot use the stringified value of boolean attributes as part
      // of the hash as we'd otherwise encounter the following case:
      //
      //   <div foo /> = <div foo="true" />
      //
      // The is not valid per the HTML5 spec as the literal values "true" and
      // "false" cannot be used for indicating boolean attributes.
      // https://www.w3.org/TR/html5/infrastructure.html#sec-boolean-attributes
      if (value === true) {
        data += name;
      } else {
        data += String(value);
      }
    }
  }

  if (isParent(node)) {
    for (const child of node.children) {
      await digest(child);

      if (hasDigest(child)) {
        data += child.digest;
      }
    }
  }

  const withDigest = assign(node, { digest: await crypto.digest(data) });

  return withDigest.digest;
}
