import { Node } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasTextContent(context: Node): Predicate<Node> {
  return node => dom.hasTextContent(node, context);
}
