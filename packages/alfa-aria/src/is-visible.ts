import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getAttribute,
  getComputedStyle,
  getParentElement,
  isElement,
  isRendered,
  Node,
  Text,
  traverseNode
} from "@siteimprove/alfa-dom";

type VisibilityMap = WeakMap<Element, boolean>;

const visibilityMaps = new WeakMap<Node, VisibilityMap>();

export function isVisible(
  node: Element | Text,
  context: Node,
  device: Device
): boolean {
  let visibilityMap = visibilityMaps.get(context);

  if (visibilityMap === undefined) {
    visibilityMap = new WeakMap();

    traverseNode(
      context,
      context,
      {
        enter(node, parentNode) {
          if (isElement(node)) {
            if (!isRendered(node, context, device)) {
              visibilityMap!.set(node, false);
            } else {
              const hidden = getAttribute(node, "aria-hidden");

              if (hidden === "true") {
                visibilityMap!.set(node, false);
              } else if (parentNode !== null && isElement(parentNode)) {
                const isParentVisible = visibilityMap!.get(parentNode);

                if (isParentVisible === false) {
                  visibilityMap!.set(node, false);
                }
              }
            }
          }
        },
        exit(node) {
          if (isElement(node)) {
            const { visibility } = getComputedStyle(node, context, device);

            if (visibility !== undefined) {
              if (
                visibility.value === "hidden" ||
                visibility.value === "collapse"
              ) {
                visibilityMap!.set(node, false);
              }
            }
          }
        }
      },
      {
        flattened: true
      }
    );

    visibilityMaps.set(context, visibilityMap);
  }

  if (isElement(node)) {
    return visibilityMap.get(node) !== false;
  }

  const parentElement = getParentElement(node, context, { flattened: true });

  if (parentElement !== null) {
    return visibilityMap.get(parentElement) !== false;
  }

  return true;
}
