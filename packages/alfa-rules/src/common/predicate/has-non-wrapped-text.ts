import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import { hasChild } from "./has-child";
import { hasComputedStyle } from "./has-computed-style";
import { isVisible } from "./is-visible";

const { and, or, test } = Refinement;
const { isElement } = Element;
const { isText } = Text;

const cache = Cache.empty<Device, Cache<Element | Text, boolean>>();

export function hasNonWrappedText(device: Device): Predicate<Element | Text> {
  return function hasNonWrappedText(node): boolean {
    return cache.get(device, Cache.empty).get(
      node,
      () =>
        test(
          and(
            hasChild(and(isText, isVisible(device)), {
              flattened: true,
            }),
            hasComputedStyle(
              "white-space",
              (whiteSpace) => whiteSpace.value === "nowrap",
              device
            )
          ),
          node
        ) ||
        node
          .children({
            flattened: true,
          })
          .filter(or(isElement, isText))
          .some(hasNonWrappedText)
    );
  };
}
