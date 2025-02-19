import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Context } from "@siteimprove/alfa-selector";
import { isFlexContainer } from "../../predicate/is-flex-container.js";
import { isGridContainer } from "../../predicate/is-grid-container.js";
import { Style } from "../../style.js";

const { or } = Predicate;

export function isFlexOrGridChild(
  device: Device,
  context?: Context,
): Predicate<Element> {
  return (element) =>
    element
      .parent(Node.fullTree)
      .filter(Element.isElement)
      .some((parent) =>
        or(
          isFlexContainer,
          isGridContainer,
        )(Style.from(parent, device, context)),
      );
}
