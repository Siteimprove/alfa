import { BrowserSpecific, map } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { Option, values } from "@siteimprove/alfa-util";
import * as Features from "./features";
import * as Roles from "./roles";
import { Category, Role } from "./types";

const whitespace = /\s+/;

/**
 * Given an element and a context, get the semantic role of the element within
 * the context. If the element does not have a role then `null` is returned.
 *
 * @see https://www.w3.org/TR/html/dom.html#aria-role-attribute
 *
 * @example
 * const button = <button>Foo</button>;
 * getRole(button, <section>{button}</section>);
 * // => Button
 */
export function getRole(
  element: Element,
  context: Node,
  device: Device,
  options: Readonly<{ explicit?: boolean; implicit?: boolean }> = {
    explicit: true,
    implicit: true
  }
): Option<Role> | BrowserSpecific<Option<Role>> {
  const value = getAttribute(element, "role", { trim: true });

  let role: Option<string> | BrowserSpecific<Option<string>>;

  // Firefox currently treats the `role` attribute as case-sensitive so if it's
  // set and it's not lowercased, we branch off.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1407167
  if (value !== null && value !== value.toLowerCase()) {
    role = BrowserSpecific.of(value, ["firefox"])
      .branch(value.toLowerCase(), ["chrome", "edge", "ie", "opera", "safari"])
      .get();
  } else {
    role = value === null ? value : value.toLowerCase();
  }

  return map(role, role => {
    if (options.explicit !== false && role !== null) {
      const roles = values(Roles);

      for (const name of role.split(whitespace)) {
        const role = roles.find(role => role.name === name);

        if (role !== undefined && role.category !== Category.Abstract) {
          return role;
        }
      }
    }

    if (options.implicit !== false) {
      const feature = values(Features).find(
        feature => feature.element === element.localName
      );

      if (feature !== undefined) {
        const role =
          typeof feature.role === "function"
            ? feature.role(element, context, device)
            : feature.role;

        if (role !== undefined) {
          return role;
        }
      }
    }

    return null;
  });
}
