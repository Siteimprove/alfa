import * as Roles from "../roles";
import { Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#object
 */
export const Object: Feature = {
  element: "object",
  allowedRoles: () => [Roles.Application, Roles.Document, Roles.Img]
};
