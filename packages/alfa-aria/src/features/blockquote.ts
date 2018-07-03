import * as Roles from "../roles";
import { Any, Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#p-pre-blockquote
 */
export const Blockquote: Feature = {
  element: "blockquote",
  allowedRoles: () => Any(Roles)
};
