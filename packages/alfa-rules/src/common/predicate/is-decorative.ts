import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasRole } from "./has-role";

const { equals, test } = Predicate;

export function isDecorative(context: Node): Predicate<Element> {
  return hasRole(context, role =>
    test(equals("presentation", "none"), role.name)
  );
}
