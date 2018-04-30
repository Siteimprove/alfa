import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#svg
 */
export const SVG: Feature = {
  element: "svg",
  allowedRoles: [Roles.Application, Roles.Document, Roles.Img]
};
