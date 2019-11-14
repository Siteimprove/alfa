import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import {
  Element,
  getAttribute,
  getElementNamespace,
  Node
} from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";

import { Feature } from "./feature";
import { Role } from "./role";

/**
 * Given an element and a context, get the semantic role of the element within
 * the context.
 *
 * @see https://html.spec.whatwg.org/#attr-aria-role
 */
export function getRole(
  element: Element,
  context: Node,
  options: getRole.Options = {}
): Branched<Option<Role>, Browser> {
  const role = getAttribute(element, context, "role").map(role => role.trim());

  return (
    Branched.of<Option<string>, Browser>(role.map(role => role.toLowerCase()))

      // Firefox currently treats the `role` attribute as case-sensitive so it
      // is not lowercased.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1407167
      .branch(role, ...Browser.query(["firefox"]))

      .map(role =>
        role
          .andThen(role => {
            if (options.explicit !== false) {
              for (const name of role.split(/\s+/)) {
                const role = Role.lookup(name);

                if (
                  role
                    .filter(role => role.category !== Role.Category.Abstract)
                    .isSome()
                ) {
                  return role;
                }
              }
            }

            return None;
          })
          .orElse(() => {
            if (options.implicit !== false) {
              return getElementNamespace(element, context).flatMap(
                namespace => {
                  const feature = Feature.lookup(namespace, element.localName);

                  return feature.flatMap(feature =>
                    feature.role(element, context).flatMap(Role.lookup)
                  );
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
