import { Cache } from "@siteimprove/alfa-cache";
import { Map } from "@siteimprove/alfa-map";

import type { Node } from "../../node.js";
import { Document } from "../document.js";
import type { Element } from "../element.js";

import { getElementDescendants } from "./descendants.js";

const elementMapCache = Cache.empty<Document, Map<string, Element>>();

/**
 * Returns a map from id to elements, in the subtree rooted at a given node.
 *
 * @privateRemarks
 * Since `id` are scoped to trees, and do not cross shadow or content boundaries,
 * we never need traversal options.
 *
 * @public
 */
export function getElementIdMap(node: Node): Map<string, Element> {
  if (Document.isDocument(node)) {
    return elementMapCache.get(node, () => buildElementIdMap(node));
  }

  return buildElementIdMap(node);
}

function buildElementIdMap(node: Node): Map<string, Element> {
  // Build a map from ID -> element to allow fast resolution of ID references.
  // The collected references are added to the map in reverse order to ensure
  // that the first occurrence of a given ID is what ends up in the map in
  // event of duplicates.
  return Map.from(
    getElementDescendants(node)
      .collect((element) => element.id.map((id) => [id, element] as const))
      .reverse(),
  );
}
