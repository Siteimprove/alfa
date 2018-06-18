import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#iframe
 */
export const IFrame: Feature = {
  element: "iframe",
  allowedRoles: () => [Roles.Application, Roles.Document, Roles.Img]
};
