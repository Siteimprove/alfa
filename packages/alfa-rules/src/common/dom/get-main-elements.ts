import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import type { Document, Element } from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Sequence } from "@siteimprove/alfa-sequence";

const { hasRole } = DOM;

/**
 * Returns all elements with a role of `main` in the flat tree of the document.
 */
export const getMainElements = Cache.memoize(function (
  device: Device,
  document: Document,
): Sequence<Element> {
  return Query.getElementDescendants(document, Node.flatTree).filter(
    hasRole(device, "main"),
  );
});
