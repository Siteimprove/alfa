import { Feature, AnyRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#time
 */
export const Time: Feature = {
  element: "time",
  allowedRoles: AnyRole
};
