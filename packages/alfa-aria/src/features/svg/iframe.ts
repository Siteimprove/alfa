import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Iframe: Feature = {
  element: "iframe",
  allowedRoles: () => [Roles.Application, Roles.Document, Roles.Img]
};
