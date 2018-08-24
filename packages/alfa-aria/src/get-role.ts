import {
  BrowserSpecific,
  isBrowserSupported
} from "@siteimprove/alfa-compatibility";
import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { values } from "@siteimprove/alfa-util";
import * as Features from "./features";
import * as Roles from "./roles";
import { Role } from "./types";

const whitespace = /\s+/;

const features = values(Features);
const roles = values(Roles);

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
  context: Node
): Role | null | BrowserSpecific<Role | null> {
  const value = getAttribute(element, "role", { trim: true });

  let role: BrowserSpecific<string | null>;

  // Firefox currently treats the `role` attribute as case-sensitive so if it's
  // set and it's not lowercased, we branch off.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1407167
  if (
    value !== null &&
    value !== value.toLowerCase() &&
    isBrowserSupported("firefox")
  ) {
    role = BrowserSpecific.of(value, ["firefox"]).branch(value.toLowerCase(), [
      "chrome",
      "edge",
      "ie",
      "opera",
      "safari"
    ]);
  } else {
    role = BrowserSpecific.of(value === null ? value : value.toLowerCase(), [
      "chrome",
      "edge",
      "firefox",
      "ie",
      "opera",
      "safari"
    ]);
  }

  return role
    .map(role => {
      if (role !== null) {
        for (const name of role.split(whitespace)) {
          const role = roles.find(role => role.name === name);

          if (role !== undefined && role.abstract !== true) {
            return role;
          }
        }
      }

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

      return null;
    })
    .get();
}
