import { Cache } from "@siteimprove/alfa-cache";
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
                  const hidden = getAttribute(node, context, "aria-hidden");

                  if (hidden.includes("true")) {
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
