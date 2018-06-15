import {
  Element,
  getAttribute,
  hasAttribute,
  Node
} from "@siteimprove/alfa-dom";
import { Feature, Role, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#select
 */
export const Select: Feature = {
  element: "select",
  role,
  allowedRoles: role === Roles.Combobox ? [Roles.Menu] : None
};

function role(select: Element, context: Node): Role | undefined {
  const size = getAttribute(select, "size");
  if (
    !hasAttribute(select, "multiple") &&
    (size === null || parseInt(size) > 1)
  ) {
    return Roles.Combobox;
  }
  return Roles.ListBox;
}
