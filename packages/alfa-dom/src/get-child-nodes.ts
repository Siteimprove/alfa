import { getAssignedNodes } from "./get-assigned-nodes";
import { isElement } from "./guards";
import { Node } from "./types";

/**
 * Given a node and a context, get the child nodes of the node within the
 * context.
 *
 * @see https://www.w3.org/TR/dom/#dom-node-childnodes
 */
export function getChildNodes(
  node: Node,
  context: Node,
  options: getChildNodes.Options = {}
): Iterable<Node> {
  const result: Array<Node> = [];

  if (options.flattened === true) {
    if (isElement(node) && node.localName === "slot") {
      return getAssignedNodes(node, context);
    }
  }

  const shadowRoot = isElement(node) ? node.shadowRoot : null;

  if (shadowRoot !== null && shadowRoot !== undefined) {
    if (options.flattened === true) {
      return getChildNodes(shadowRoot, context, options);
    }

    if (options.composed === true) {
      result.push(shadowRoot);
    }
  }

  const { childNodes } = node;

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const childNode = childNodes[i];

    if (
      options.flattened === true &&
      isElement(childNode) &&
      childNode.localName === "slot"
    ) {
      result.push(...getAssignedNodes(childNode, context));
    } else {
      result.push(childNode);
    }
  }

  return result;
}

export namespace getChildNodes {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
