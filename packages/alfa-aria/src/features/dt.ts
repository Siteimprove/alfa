import { Feature, None } from "../types";
import * as Roles from "../roles";
/**
 * @see https://www.w3.org/TR/html-aria/#dt
 */
export const Dt: Feature = {
  element: "dt",
  role: Roles.ListItem,
  allowedRoles: None
};
