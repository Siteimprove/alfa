import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node, ShadowRoot } from "./types";

type HostMap = WeakMap<ShadowRoot, Element>;

const hostMaps = new WeakMap<Node, HostMap>();

/**
 * Given a shadow root and a context, get the host of the shadow root within the
 * context. If the shadow root has no host, `null` is returned.
 *
 * @see https://dom.spec.whatwg.org/#dom-shadowroot-host
 */
export function getHost(shadowRoot: ShadowRoot, context: Node): Element | null {
  let hostMap = hostMaps.get(context);

  if (hostMap === undefined) {
    hostMap = new WeakMap();

    traverseNode(
      context,
      context,
      {
        enter(node) {
          if (
            isElement(node) &&
            node.shadowRoot !== null &&
            node.shadowRoot !== undefined
          ) {
            hostMap!.set(node.shadowRoot, node);
          }
        }
      },
      {
        composed: true,
        nested: true
      }
    );

    hostMaps.set(context, hostMap);
  }

  const host = hostMap.get(shadowRoot);

  if (host === undefined) {
    return null;
  }

  return host;
}
