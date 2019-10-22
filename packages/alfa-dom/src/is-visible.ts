import { Device } from "@siteimprove/alfa-device";
import { Cache } from "@siteimprove/alfa-util";
import { getParentElement } from "./get-parent-element";
import { getPropertyValue } from "./get-property-value";
import { getCascadedStyle, getComputedStyle } from "./get-style";
import { isElement, isText } from "./guards";
import { isRendered } from "./is-rendered";
import { traverseNode } from "./traverse-node";
import { Element, Node, Text } from "./types";

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

      [
        ...traverseNode(
          context,
          context,
          {
            *enter(node, parentNode) {
              if (isElement(node)) {
                visibilities.set(node, true);

                if (!isRendered(node, context, device)) {
                  visibilities.set(node, false);
                } else {
                  const opacity = getPropertyValue(
                    getCascadedStyle(node, context, device),
                    "opacity"
                  );

                  if (opacity !== null && opacity.value === 0) {
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
            *exit(node) {
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
        )
      ];

      return visibilities;
    })
    .get(node, () => false);
}
