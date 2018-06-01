import {
  Element,
  getAttribute,
  hasAttribute,
  Node
} from "@siteimprove/alfa-dom";
import { Feature, Role, NoRole } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#select
 */
export const Select: Feature = {
  element: "select",
  role,
  allowedRoles
};

function role(select: Element, context: Node): Role | undefined {
  if (
    !hasAttribute(select, "multiple") &&
    Number(getAttribute(select, "size")) <= 1
  ) {
    return Roles.Combobox;
  }
  if (
    hasAttribute(select, "multiple") ||
    Number(getAttribute(select, "size")) > 1
  ) {
    return Roles.ListBox;
  }
  return undefined;
}

function allowedRoles(
  select: Element,
  context: Node
): Array<Role> | typeof NoRole {
  if (
    !hasAttribute(select, "multiple") &&
    Number(getAttribute(select, "size")) <= 1
  ) {
    return [Roles.Menu];
  }
  if (
    hasAttribute(select, "multiple") ||
    Number(getAttribute(select, "size")) > 1
  ) {
    NoRole;
  }
  return NoRole; //The documentation does not explicitly state this
}
