import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getAttribute,
  getElementNamespace,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { values } from "@siteimprove/alfa-util";
import * as Features from "./features";
import * as Roles from "./roles";
import { Category, Feature, Role } from "./types";

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
 */
export function getRole(
  element: Element,
  context: Node,
  device: Device,
  options: getRole.Options = { explicit: true, implicit: true }
): Branched<Option<Role>, Browser.Release> {
  const role = getAttribute(element, context, "role").map(role => role.trim());

  return (
    Branched.of<Option<string>, Browser.Release>(
      role.map(role => role.toLowerCase())
    )

      // Firefox currently treats the `role` attribute as case-sensitive so it
      // is not lowercased.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1407167
      .branch(role, ...Browser.query(["firefox"]))

      .map(role =>
        role
          .andThen(role => {
            if (options.explicit !== false) {
              for (const name of role.split(whitespace)) {
                const role = rolesByName.get(name);

                if (role !== undefined && role.category !== Category.Abstract) {
                  return Some.of(role);
                }
              }
            }

            return None;
          })
          .orElse(() => {
            if (options.implicit !== false) {
              return getElementNamespace(element, context).flatMap(
                elementNamespace => {
                  const featuresByElement = featuresByNamespace.get(
                    elementNamespace
                  );

                  const feature =
                    featuresByElement === undefined
                      ? undefined
                      : featuresByElement.get(element.localName);

                  if (feature !== undefined) {
                    const role =
                      typeof feature.role === "function"
                        ? feature.role(element, context, device)
                        : feature.role;

                    if (role !== undefined && role !== null) {
                      return Some.of(role);
                    }
                  }

                  return None;
                }
              );
            }

            return None;
          })
      )
  );
}

export namespace getRole {
  export interface Options {
    readonly explicit?: boolean;
    readonly implicit?: boolean;
  }
}
