import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/html5/embedded-content-0.html#the-audio-element
 */
export const Audio: Feature = {
  element: "audio",
  allowedRoles: () => [Roles.Application]
};
