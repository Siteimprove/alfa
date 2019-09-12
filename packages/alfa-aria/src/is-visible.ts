import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getAttribute,
  getComputedStyle,
  getParentElement,
  getPropertyValue,
  isElement,
  isRendered,
  isText,
  Node,
  Text,
  traverseNode
} from "@siteimprove/alfa-dom";
import { Cache } from "@siteimprove/alfa-util";

const visibilities = Cache.of<Node, Cache<Device, Cache<Element, boolean>>>();

export function isVisible(
  node: Element | Text,
  context: Node,
  device: Device
): boolean {
  if (isText(node)) {
    const parentElement = getParentElement(node, context, { flattened: true });

    if (parentElement === null) {
      return false;
    }

    node = parentElement;
  }

  return visibilities
    .get(context, Cache.of)
    .get(device, () => {
      const visibilities = Cache.of<Element, boolean>();

      traverseNode(
        context,
        context,
        {
          enter(node, parentNode) {
            if (isElement(node)) {
              visibilities.set(node, true);

              if (!isRendered(node, context, device)) {
                visibilities.set(node, false);
              } else {
                const hidden = getAttribute(node, "aria-hidden");

                if (hidden === "true") {
                  visibilities.set(node, false);
                } else if (parentNode !== null && isElement(parentNode)) {
                  const isParentVisible = visibilities.get(parentNode);

                  if (isParentVisible === false) {
                    visibilities.set(node, false);
                  }
                }
              }
            }
          },
          exit(node) {
            if (isElement(node)) {
              const visibility = getPropertyValue(
                getComputedStyle(node, context, device),
                "visibility"
              );

              if (visibility !== null) {
                if (
                  visibility.value === "hidden" ||
                  visibility.value === "collapse"
                ) {
                  visibilities.set(node, false);
                }
              }
            }
          }
        },
        { flattened: true, nested: true }
      );

      return visibilities;
    })
    .get(node, () => false);
}
