import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/html5/embedded-content-0.html#the-iframe-element
 */
export const Iframe: Feature = {
  element: "iframe",
  allowedRoles: () => [Roles.Application, Roles.Document, Roles.Img]
};
