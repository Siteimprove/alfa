import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Option, Some } from "@siteimprove/alfa-option";
import { getRole } from "./get-role";
import { Category } from "./types";

/**
 * Given an element and a context, get the category of the semantic role of the
 * element within the context. If the element does not have a role then `null`
 * is returned.
 *
 * @see https://www.w3.org/TR/wai-aria/#roles_categorization
 */
export function getRoleCategory(
  element: Element,
  context: Node,
  device: Device
): Branched<Option<Category>, Browser.Release> {
  return getRole(element, context, device).map(role =>
    role.flatMap(role =>
      Some.of(
        typeof role.category === "function"
          ? role.category(element, context, device)
          : role.category
      )
    )
  );
}
