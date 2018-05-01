import { Element, getAttribute, hasAttribute } from "@alfa/dom";
import { Feature, Role, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#select
 */
export const Select: Feature = {
  element: "select",
  role,
  allowedRoles
};
//TODO Verify with Kasper
//TODO Specifically, type=checkbox "when used in conjunction with aria-pressed"
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
): Array<Role> | typeof None {
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
    None;
  }
  return None; //The documentation does not explicitly state this
}
