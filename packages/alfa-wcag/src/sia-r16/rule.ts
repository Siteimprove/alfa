import { Atomic } from "@siteimprove/alfa-act";
import { getRole, Role } from "@siteimprove/alfa-aria";
import {
  BrowserSpecific,
  every,
  map,
  some
} from "@siteimprove/alfa-compatibility";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-util";

export const SIA_R16: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r16.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node => isElement(node) && hasExplicitRole(node, document)
      )
    );

    expectations((target, expectation) => {
      const role = getExplicitRole(target, document);

      expectation(
        1,
        every(role, role => {
          if (role === null || role.required === undefined) {
            return true;
          }

          const implicits =
            role.implicits === undefined
              ? []
              : role.implicits(target, document);

          for (const attribute of role.required(target, document)) {
            const value = getAttribute(target, attribute.name, { trim: true });

            if (value === null || value === "") {
              if (
                implicits.find(implicit => implicit[0] === attribute) ===
                undefined
              ) {
                return false;
              }
            }
          }

          return true;
        })
      );
    });
  }
};

function getExplicitRole(
  element: Element,
  context: Node
): Option<Role> | BrowserSpecific<Option<Role>> {
  const implicitRole = getRole(element, context, { explicit: false });
  const explicitRole = getRole(element, context, { implicit: false });

  return map(explicitRole, explicitRole => {
    if (
      explicitRole !== null &&
      some(implicitRole, implicitRole => explicitRole !== implicitRole)
    ) {
      return explicitRole;
    }

    return null;
  });
}

function hasExplicitRole(element: Element, context: Node): boolean {
  return some(
    getExplicitRole(element, context),
    explicitRole => explicitRole !== null
  );
}
