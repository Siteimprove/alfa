import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { getPositioningParent, hasComputedStyle } from "../../element/element";

const { isElement } = Element;
const { and } = Predicate;

const overflowVisibleX = (device: Device) =>
  hasComputedStyle(
    "overflow-x",
    (overflow) => overflow.value === "visible",
    device,
  );

const overflowVisibleY = (device: Device) =>
  hasComputedStyle(
    "overflow-y",
    (overflow) => overflow.value === "visible",
    device,
  );

const overflowClipX = (device: Device) =>
  hasComputedStyle(
    "overflow-x",
    (overflow) => overflow.value === "clip",
    device,
  );

const overflowClipY = (device: Device) =>
  hasComputedStyle(
    "overflow-y",
    (overflow) => overflow.value === "clip",
    device,
  );

export function isScrolledBehind(device: Device): Predicate<Node> {
  return function isScrolledBehind(node): boolean {
    return cache.get(device, Cache.empty).get(node, () => {
      if (isElement(node)) {
        // Is element and scrolled behind?
        const container = getPositioningParent(node, device);

        if (!container.isSome()) {
          // There is no container to be scrolled behind in
          return false;
        }

        const renderedOutside = and(
          overflowVisibleX(device),
          overflowVisibleY(device),
        );
        if (renderedOutside(container.get())) {
          // Content is always visible
          return false;
        }

        // If we don't have layout, we cannot know if content is scrolled behind or not.
        // We assume it is not scrolled behind.
        const elementBox = node.getBoundingBox(device);
        const containerBox = container.get().getBoundingBox(device);
        if (!elementBox.isSome() || !containerBox.isSome()) {
          return false;
        }

        const renderedToTheRight = and(
          overflowVisibleX(device),
          overflowClipY(device),
        );
        if (renderedToTheRight(container.get())) {
          // Content is visible unless it is completely below container
          return containerBox.get().bottom < elementBox.get().top;
        }

        const renderedBelow = and(
          overflowClipX(device),
          overflowVisibleY(device),
        );
        if (renderedBelow(container.get())) {
          // Content is visible unless it is completely to the right of the container
          return containerBox.get().right < elementBox.get().left;
        }

        if (!containerBox.get().intersects(elementBox.get())) {
          // The content is not inside the container, i.e. it's scrolled behind
          return true;
        }

        // The element is not scrolled behind the parent container,
        // but it might be scrolled behind an ancestor container.
        return isScrolledBehind(container.get());
      } else {
        // Not an element, check the parent
        return node.parent(Node.fullTree).some(isScrolledBehind);
      }
    });
  };
}

const cache = Cache.empty<Device, Cache<Node, boolean>>();
