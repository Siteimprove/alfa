import { Cache } from "@siteimprove/alfa-cache";
import { Map } from "@siteimprove/alfa-map";

import { Query } from ".";
import { Node } from "../../node";
import { Document } from "../document";
import { Element } from "../element";

const elementMapCache = Cache.empty<Document, Map<string, Element>>();

/**
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
    Query.getElementDescendants(node)
      .collect((element) => element.id.map((id) => [id, element] as const))
      .reverse()
  );
}
