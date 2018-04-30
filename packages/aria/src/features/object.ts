import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#object
 */
export const Object: Feature = {
  element: "object",
  allowedRoles: [Roles.Application, Roles.Document, Roles.Img]
};
