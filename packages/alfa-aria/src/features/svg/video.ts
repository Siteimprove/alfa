import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/html5/embedded-content-0.html#the-video-element
 */
export const Video: Feature = {
  element: "video",
  allowedRoles: () => [Roles.Application]
};
