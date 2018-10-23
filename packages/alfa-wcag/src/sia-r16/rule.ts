import { Atomic } from "@siteimprove/alfa-act";
import { getRole } from "@siteimprove/alfa-aria";
import { every, some } from "@siteimprove/alfa-compatibility";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

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
      const role = getRole(target, document, { implicit: false })!;

      expectation(
        1,
        every(role, role => {
          if (role === null || role.required === undefined) {
            return true;
          }

          for (const attribute of role.required(target, document)) {
            const value = getAttribute(target, attribute.name, { trim: true });

            if (value === null || value === "") {
              return false;
            }
          }

          return true;
        })
      );
    });
  }
};

function hasExplicitRole(element: Element, context: Node): boolean {
  const role = getRole(element, context);

  if (every(role, role => role === null)) {
    return false;
  }

  const explicitRole = getRole(element, context, { implicit: false });

  return some(
    explicitRole,
    explicitRole =>
      explicitRole !== null && some(role, role => explicitRole !== role)
  );
}
