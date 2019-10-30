import { Cache } from "@siteimprove/alfa-cache";
import { Option } from "@siteimprove/alfa-option";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node, ShadowRoot } from "./types";

const cache = Cache.empty<Node, Cache<ShadowRoot, Element>>();

/**
 * Given a shadow root and a context, get the host of the shadow root within the
 * context. If the shadow root has no host, `null` is returned.
 *
 * @see https://dom.spec.whatwg.org/#dom-shadowroot-host
 */
export function getHost(
  shadowRoot: ShadowRoot,
  context: Node
): Option<Element> {
  return cache
    .get(context, () =>
      Cache.from<ShadowRoot, Element>(
        traverseNode(
          context,
          context,
          {
            *enter(node) {
              if (
                isElement(node) &&
                node.shadowRoot !== null &&
                node.shadowRoot !== undefined
              ) {
                yield [node.shadowRoot, node];
              }
            }
          },
          { composed: true, nested: true }
        )
      )
    )
    .get(shadowRoot);
}
