import { Feature } from "../types";
import * as Roles from "../roles";
/**
 * @see https://www.w3.org/TR/html-aria/#embed
 */
export const Embed: Feature = {
  element: "embed",
  allowedRoles: [
    Roles.Application,
    Roles.Document,
    Roles.Presentation,
    Roles.None,
    Roles.Img
  ]
};
