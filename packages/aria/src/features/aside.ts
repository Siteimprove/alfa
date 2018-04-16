import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#aside
 */
export const Aside: Feature = {
  element: "aside",
  role: Roles.Complementary,
  allowedRoles: [
    Roles.Feed,
    Roles.Note,
    Roles.Presentation,
    Roles.None,
    Roles.Region,
    Roles.Search
  ]
};
