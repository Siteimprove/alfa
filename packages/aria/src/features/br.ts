import { Feature, AnyRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#br
 */
export const Br: Feature = {
  element: "br",
  allowedRoles: AnyRole
};
