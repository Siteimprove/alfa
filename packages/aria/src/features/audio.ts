import { AnyAttribute, Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#audio
 */
export const Audio: Feature = {
  element: "audio",
  allowedRoles: [Roles.Application],
  allowedAttributes: AnyAttribute
};
