import { Feature, AnyRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#kbd
 */
export const Kbd: Feature = {
  element: "kbd",
  allowedRoles: AnyRole
};
