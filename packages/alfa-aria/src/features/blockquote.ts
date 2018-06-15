import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#p-pre-blockquote
 */
export const Blockquote: Feature = {
  element: "blockquote",
  allowedRoles: Any(Roles)
};
