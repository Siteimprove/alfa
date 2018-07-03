import * as Roles from "../roles";
import { Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#video
 */
export const Video: Feature = {
  element: "video",
  allowedRoles: () => [Roles.Application]
};
