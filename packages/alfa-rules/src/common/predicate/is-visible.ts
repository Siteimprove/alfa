import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { isClipped } from "./is-clipped";
import { isOffscreen } from "./is-offscreen";
import { isRendered } from "./is-rendered";
import { isReplaced } from "./is-replaced";
import { isTransparent } from "./is-transparent";

const { every } = Iterable;
const { not } = Predicate;
const { and, or } = Refinement;
const { hasName, isElement } = Element;
const { isText } = Text;

export function isVisible(device: Device, context?: Context): Predicate<Node> {
  return and(
    isRendered(device, context),
    not(isTransparent(device, context)),
    not(
      and(
        or(isElement, isText),
        or(isClipped(device, context), isOffscreen(device, context))
      )
    ),
    (node) => {
      if (
        isElement(node) &&
        Style.from(node, device, context)
          .computed("visibility")
          .some((visibility) => visibility.value !== "visible")
      ) {
        return false;
      }

      if (isText(node)) {
        if (node.data.trim() === "") {
          return false;
        }

        if (
          node
            .parent({
              flattened: true,
            })
            .filter(isElement)
            .some((element) =>
              Style.from(element, device, context)
                .computed("font-size")
                .some((size) => size.value === 0)
            )
        ) {
          return false;
        }
      }

      return true;
    },
    // Most non-replaced elements with no visible children are not visible while
    // replaced elements are assumed to be replaced by something visible. Some
    // non-replaced elements are, however, visible even when empty.
    not(
      and(
        isElement,
        and(not(or(isReplaced, isVisibleWhenEmpty)), (element) =>
          every(
            element.children({
              nested: true,
              flattened: true,
            }),
            not(isVisible(device, context))
          )
        )
      )
    )
  );
}

/**
 * Elements that are *not* "replaced elements" but are nonetheless visible when
 * empty
 */
const isVisibleWhenEmpty = hasName("textarea");
