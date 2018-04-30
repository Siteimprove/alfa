import { Element } from "@alfa/dom";
import { Feature, Role, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#summary
 */
export const Summary: Feature = {
  element: "summary",
  role: Roles.Button,
  allowedRoles
};

function allowedRoles(summary: Element, context: Node): Array<Role> {
  return []; //TODO implement
}
