import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";

import { getParentElement } from "./get-parent-element";
import { getPropertyValue } from "./get-property-value";
import { getCascadedStyle, getComputedStyle } from "./get-style";
import { isElement, isText } from "./guards";
import { isRendered } from "./is-rendered";
import { traverseNode } from "./traverse-node";
import { Element, Node, Text } from "./types";

const visibilities = Cache.empty<
  Node,
  Cache<Device, Cache<Element, boolean>>
>();

export function isVisible(
  node: Element | Text,
  context: Node,
  device: Device
): boolean {
  if (isText(node)) {
    // Text nodes that consist only of whitespace characters will never be
    // visible.
    if (node.data.trim() === "") {
      return false;
    }

    return getParentElement(node, context, { flattened: true })
      .map(parentElement => isVisible(parentElement, context, device))
      .getOr(false);
  }

  return visibilities
    .get(context, Cache.empty)
    .get(device, () => {
      const visibilities = Cache.empty<Element, boolean>();

      return visibilities.merge(
        traverseNode(
          context,
          context,
          {
            *enter(node, parentNode) {
              if (isElement(node)) {
                yield [node, true];

                if (!isRendered(node, context, device)) {
                  yield [node, false];
                } else {
                  const opacity = getPropertyValue(
                    getCascadedStyle(node, context, device),
                    "opacity"
                  );

                  if (opacity.isSome() && opacity.get().value === 0) {
                    yield [node, false];
                  } else if (parentNode !== null && isElement(parentNode)) {
                    const isParentVisible = visibilities.get(parentNode);

                    if (isParentVisible.includes(false)) {
                      yield [node, false];
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

                if (visibility.isSome()) {
                  switch (visibility.get().value) {
                    case "hidden":
                    case "collapse":
                      yield [node, false];
                  }
                }
              }
            }
          },
          { flattened: true, nested: true }
        )
      );
    })
    .get(node, () => false);
}
