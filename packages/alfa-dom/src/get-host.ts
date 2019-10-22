import { Cache } from "@siteimprove/alfa-util";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node, ShadowRoot } from "./types";

const hosts = Cache.of<Node, Cache<ShadowRoot, Element>>();

/**
 * Given a shadow root and a context, get the host of the shadow root within the
 * context. If the shadow root has no host, `null` is returned.
 *
 * @see https://dom.spec.whatwg.org/#dom-shadowroot-host
 */
export function getHost(shadowRoot: ShadowRoot, context: Node): Element | null {
  return hosts
    .get(context, () => {
      const hosts = Cache.of<ShadowRoot, Element>();

      [
        ...traverseNode(
          context,
          context,
          {
            *enter(node) {
              if (
                isElement(node) &&
                node.shadowRoot !== null &&
                node.shadowRoot !== undefined
              ) {
                hosts.set(node.shadowRoot, node);
              }
            }
          },
          { composed: true, nested: true }
        )
      ];

      return hosts;
    })
    .get(shadowRoot);
}
