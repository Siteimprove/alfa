import { getClosest } from "@siteimprove/alfa-dom";
import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#td
 */
export const Td: Feature = {
  element: "td",
  role: (td, context) =>
    getClosest(td, context, "table") !== null ? Roles.Cell : undefined,
  allowedRoles: Any(Roles)
};
