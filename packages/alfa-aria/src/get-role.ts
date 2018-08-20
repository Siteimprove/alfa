import { Browser, isBrowserSupported } from "@siteimprove/alfa-compatibility";
import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { values } from "@siteimprove/alfa-util";
import * as Features from "./features";
import * as Roles from "./roles";
import { Role } from "./types";

const whitespace = /\s+/;

const features = values(Features);
const roles = values(Roles);

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
  const role = getAttribute(element, "role", {
    trim: true,

    // Firefox currently treats the `role` attribute as case-sensitive so we can
    // only treat it as case-insensitive if Firefox is not supported.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1407167
    lowerCase: !isBrowserSupported(Browser.Firefox)
  });

  if (role === null) {
    const feature = features.find(
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
      const role = roles.find(role => role.name === name);

      if (role !== undefined && role.abstract !== true) {
        return role;
      }
    }
  }

  return null;
}
