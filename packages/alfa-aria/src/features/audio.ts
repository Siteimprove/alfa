import * as Roles from "../roles";
import { Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#audio
 */
export const Audio: Feature = {
  element: "audio",
  allowedRoles: () => [Roles.Application]
};
