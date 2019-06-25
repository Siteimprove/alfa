import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://html.spec.whatwg.org/multipage/canvas.html#canvas
 */
export const Canvas: Feature = {
  element: "canvas",
  allowedRoles: () => Any(Roles)
};
