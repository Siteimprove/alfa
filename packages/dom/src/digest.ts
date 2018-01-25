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

      // A false value indicates that the attribute is non-present per the HTML5
      // spec, so we can skip it altogether. Likewise, we are not interested in
      // attributes with undefined values.
      // https://www.w3.org/TR/html5/infrastructure.html#sec-boolean-attributes
      if (value === false || value === undefined) {
        continue;
      }

      sha.update(name);

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
        sha.update(name);
      } else {
        sha.update(String(value));
      }
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
