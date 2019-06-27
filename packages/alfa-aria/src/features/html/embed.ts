import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#embed
 */
export const Embed: Feature = {
  element: "embed",
  allowedRoles: () => [
    Roles.Application,
    Roles.Document,
    Roles.Presentation,
    Roles.None,
    Roles.Img
  ]
};
