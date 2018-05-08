import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#video
 */
export const Video: Feature = {
  element: "video",
  allowedRoles: [Roles.Application]
};
