import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasTextContent(
  predicate: Predicate<string> = () => true,
  options: Node.Traversal = {}
): Predicate<Node> {
  return node => predicate(node.textContent(options));
}
