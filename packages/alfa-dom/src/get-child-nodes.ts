import { getAssignedNodes } from "./get-assigned-nodes";
import { isElement } from "./guards";
import { Node } from "./types";

/**
 * Given a node and a context, get the child nodes of the node within the
 * context.
 *
 * @see https://dom.spec.whatwg.org/#dom-node-childnodes
 */
export function* getChildNodes(
  node: Node,
  context: Node,
  options: getChildNodes.Options = {}
): Iterable<Node> {
  if (options.flattened === true) {
    if (isElement(node) && node.localName === "slot") {
      return yield* getAssignedNodes(node, context);
    }
  }

  const shadowRoot = isElement(node) ? node.shadowRoot : null;

  if (shadowRoot !== null && shadowRoot !== undefined) {
    if (options.flattened === true) {
      return yield* getChildNodes(shadowRoot, context, options);
    }

    if (options.composed === true) {
      yield shadowRoot;
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
      yield* getAssignedNodes(childNode, context);
    } else {
      yield childNode;
    }
  }
}

export namespace getChildNodes {
  export interface Options {
    readonly composed?: boolean;
    readonly flattened?: boolean;
  }
}
