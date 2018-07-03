import {
  Element,
  getAttribute,
  hasAttribute,
  Node
} from "@siteimprove/alfa-dom";
import * as Roles from "../roles";
import { Feature, None, Role } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#select
 */
export const Select: Feature = {
  element: "select",
  role,
  allowedRoles: (select, context) =>
    role(select, context) === Roles.Combobox ? [Roles.Menu] : None(Roles)
};

function role(select: Element, context: Node): Role {
  const size = getAttribute(select, "size");
  if (
    !hasAttribute(select, "multiple") &&
    (size === null || parseInt(size) > 1)
  ) {
    return Roles.Combobox;
  }
  return Roles.ListBox;
}
