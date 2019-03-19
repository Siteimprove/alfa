import { Atomic } from "@siteimprove/alfa-act";
import { getRole, Role } from "@siteimprove/alfa-aria";
import {
  BrowserSpecific,
  every,
  map,
  some
} from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-util";

export const SIA_R16: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r16.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { device, document }) => {
    applicability(document, () => {
      return querySelectorAll<Element>(
        document,
        document,
        node => isElement(node) && hasExplicitRole(node, document, device)
      );
    });

    expectations((aspect, target) => {
      const role = getExplicitRole(target, document, device);

      return {
        1: {
          holds: every(role, role => {
            if (role === null || role.required === undefined) {
              return true;
            }

            const implicits =
              role.implicits === undefined
                ? []
                : role.implicits(target, document, device);

            for (const attribute of role.required(target, document, device)) {
              const value = getAttribute(target, attribute.name, {
                trim: true
              });

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
        }
      };
    });
  }
};

function getExplicitRole(
  element: Element,
  context: Node,
  device: Device
): Option<Role> | BrowserSpecific<Option<Role>> {
  const implicitRole = getRole(element, context, device, { explicit: false });
  const explicitRole = getRole(element, context, device, { implicit: false });

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

function hasExplicitRole(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return some(
    getExplicitRole(element, context, device),
    explicitRole => explicitRole !== null
  );
}
