import { getClosest } from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#td
 */
export const Td: Feature = {
  element: "td",
  role: (td, context) =>
    getClosest(td, context, "table") !== null ? Roles.Cell : null,
  allowedRoles: () => Any(Roles)
};
