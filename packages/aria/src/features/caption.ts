import { Feature, NoRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#caption
 */
export const Caption: Feature = {
  element: "caption",
  allowedRoles: NoRole
};
