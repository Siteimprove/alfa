import { values } from "@siteimprove/alfa-util";
import { Node, Element, getAttribute } from "@siteimprove/alfa-dom";
import { Role } from "./types";
import * as Roles from "./roles";
import * as Features from "./features";

const whitespace = /\s+/;

/**
 * Get the semantic role of an element.
 *
 * @see https://www.w3.org/TR/html/dom.html#aria-role-attribute
 *
 * @example
 * const button = <button>Foo</button>;
 * getRole(button, <section>{button}</section>);
 * // => Button
 *
 * @param element The element whose semantic role to get.
 * @return The semantic role of the element if one exists, otherwise `null`.
 */
export function getRole(element: Element, context: Node): Role | null {
  const role = getAttribute(element, "role");

  if (role === null) {
    const feature = values(Features).find(
      feature => feature.element === element.localName
    );

    if (feature !== undefined) {
      const role =
        typeof feature.role === "function"
          ? feature.role(element, context)
          : feature.role;

      if (role !== undefined) {
        return role;
      }
    }
  } else {
    for (const name of role.split(whitespace)) {
      const role = values(Roles).find(role => role.name === name);

      if (role !== undefined && !role.abstract) {
        return role;
      }
    }
  }

  return null;
}
