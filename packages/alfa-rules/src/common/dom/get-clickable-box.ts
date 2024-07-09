import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { None, Option } from "@siteimprove/alfa-option";

const { isElement } = Element;

const cache = Cache.empty<Device, Cache<Element, Option<Rectangle>>>();

/**
 * Gets the bounding box of the clickable area of an element
 * or None if the element or one of its descendants doesn't have a bounding box.
 *
 * @remarks
 * This function assumes that the element can receive pointer events, i.e. is clickable.
 * If called on an element that is not clickable, the function will still return the
 * the area that would be clickable if the element could receive pointer events.
 *
 * @internal
 */
export function getClickableBox(
  device: Device,
  element: Element,
): Option<Rectangle> {
  return cache.get(device, Cache.empty).get(element, () => {
    let boxes: Array<Rectangle> = [];
    for (let box of element
      .inclusiveDescendants(Node.flatTree)
      .filter(isElement)
      .map((element) => element.getBoundingBox(device))) {
      if (!box.isSome()) {
        return None;
      }

      boxes.push(box.get());
    }

    return Option.of(Rectangle.union(...boxes));
  });
}
