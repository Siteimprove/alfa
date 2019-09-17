import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getAttribute,
  getElementNamespace,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Option, values } from "@siteimprove/alfa-util";
import * as Features from "./features";
import * as Roles from "./roles";
import { Category, Feature, Role } from "./types";

const { map } = BrowserSpecific;

const whitespace = /\s+/;

const rolesByName = new Map<string, Role>();

for (const role of values(Roles)) {
  rolesByName.set(role.name, role);
}

const htmlFeaturesByElement = new Map<string, Feature>();

for (const feature of values(Features.HTML)) {
  htmlFeaturesByElement.set(feature.element, feature);
}

const svgFeaturesByElement = new Map<string, Feature>();

for (const feature of values(Features.SVG)) {
  svgFeaturesByElement.set(feature.element, feature);
}

const featuresByNamespace = new Map<Namespace, Map<string, Feature>>();

featuresByNamespace.set(Namespace.HTML, htmlFeaturesByElement);
featuresByNamespace.set(Namespace.SVG, svgFeaturesByElement);

/**
 * Given an element and a context, get the semantic role of the element within
 * the context. If the element does not have a role then `null` is returned.
 *
 * @see https://html.spec.whatwg.org/#attr-aria-role
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
  options: getRole.Options = { explicit: true, implicit: true }
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
      for (const name of role.split(whitespace)) {
        const role = rolesByName.get(name);

        if (role !== undefined && role.category !== Category.Abstract) {
          return role;
        }
      }
    }

    if (options.implicit !== false) {
      const elementNamespace = getElementNamespace(element, context);

      if (elementNamespace === null) {
        return null;
      }

      const featuresByElement = featuresByNamespace.get(elementNamespace);

      const feature =
        featuresByElement === undefined
          ? undefined
          : featuresByElement.get(element.localName);

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

export namespace getRole {
  export interface Options {
    readonly explicit?: boolean;
    readonly implicit?: boolean;
  }
}
