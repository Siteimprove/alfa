import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { type Element, Query } from "@siteimprove/alfa-dom";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Err, Result } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";

const { getInclusiveElementDescendants } = Query;
const { isVisible } = Style;

const cache = Cache.empty<Device, Cache<Element, Result<Rectangle, string>>>();

/**
 * Gets the bounding box of the clickable area of an element
 * or an error if the element or one of its descendants doesn't have a bounding box
 * or if the element itself is not visible.
 *
 * @remarks
 * This function assumes that the element can receive pointer events, i.e. is clickable.
 * If called on an element that is not clickable, the function will still return the
 * the area that would be clickable if the element could receive pointer events.
 *
 * The clickable box is approximated by the smallest rectangle containing
 * the bounding boxes of the element and all its visible descendants.
 *
 * @internal
 */
export function getClickableBox(
  device: Device,
  element: Element,
): Result<Rectangle, string> {
  const visible = isVisible(device);

  return cache
    .get(device, Cache.empty)
    .get(element, (): Result<Rectangle, string> => {
      if (!visible(element)) {
        return Err.of("Cannot get clickable box of an invisible element.");
      }

      let boxes: Array<Rectangle> = [];
      for (let box of getInclusiveElementDescendants(element)
        .filter(visible)
        .map((element) => element.getBoundingBox(device))) {
        if (!box.isSome()) {
          return Err.of(
            "The element of one its descendants does not have a bounding box.",
          );
        }

        boxes.push(box.get());
      }

      return Result.of(Rectangle.union(...boxes));
    });
}
