import * as Roles from "../roles";
import { Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#svg
 */
export const SVG: Feature = {
  element: "svg",
  allowedRoles: () => [Roles.Application, Roles.Document, Roles.Img]
};
