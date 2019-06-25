import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://html.spec.whatwg.org/multipage/canvas.html#canvas
 */
export const Audio: Feature = {
  element: "audio",
  allowedRoles: () => [Roles.Application]
};
