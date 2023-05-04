import { Cache } from "@siteimprove/alfa-cache";
import { Map } from "@siteimprove/alfa-map";

import { Query } from ".";
import { Node } from "../../node";
import { Document } from "../document";
import { Element } from "../element";

const { getElementDescendants } = Query;

const elementMapCache = Cache.empty<Document, Map<string, Element>>();

// Build a map from ID -> element to allow fast resolution of ID references.
// The collected references are added to the map in reverse order to ensure
// that the first occurrence of a given ID is what ends up in the map in
// event of duplicates.
export function getElementIdMap(node: Node): Map<string, Element> {
  const root = node.root();

  if (Document.isDocument(root)) {
    return elementMapCache.get(root, () => buildElementIdMap(root));
  }

  return buildElementIdMap(root);
}

function buildElementIdMap(node: Node): Map<string, Element> {
  return Map.from(
    getElementDescendants(node)
      .collect((element) => element.id.map((id) => [id, element] as const))
      .reverse()
  );
}
