import { Atomic } from "@siteimprove/alfa-act";
import { getRole, Role } from "@siteimprove/alfa-aria";
import { BrowserSpecific, map } from "@siteimprove/alfa-compatibility";
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
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll(document, document, isElement, {
          composed: true
        }).map(element => {
          return map(
            hasExplicitRole(element, document, device),
            hasExplicitRole => {
              return {
                applicable: hasExplicitRole,
                aspect: document,
                target: element
              };
            }
          );
        });
      },

      expectations: (aspect, target) => {
        return map(
          hasRequiredValues(target, document, device),
          hasRequiredValues => {
            return {
              1: { holds: hasRequiredValues }
            };
          }
        );
      }
    };
  }
};

function getExplicitRole(
  element: Element,
  context: Node,
  device: Device
): Option<Role> | BrowserSpecific<Option<Role>> {
  return map(
    getRole(element, context, device, { implicit: false }),
    explicitRole => {
      if (explicitRole === null) {
        return null;
      }

      return map(
        getRole(element, context, device, { explicit: false }),
        implicitRole => {
          if (explicitRole !== implicitRole) {
            return explicitRole;
          }

          return null;
        }
      );
    }
  );
}

function hasExplicitRole(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getExplicitRole(element, context, device), explicitRole => {
    return explicitRole !== null;
  });
}

function hasRequiredValues(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getExplicitRole(element, document, device), role => {
    if (role === null || role.required === undefined) {
      return true;
    }

    const implicits =
      role.implicits === undefined
        ? []
        : role.implicits(element, document, device);

    for (const attribute of role.required(element, document, device)) {
      const value = getAttribute(element, attribute.name, {
        trim: true
      });

      if (value === null || value === "") {
        if (
          implicits.find(implicit => implicit[0] === attribute) === undefined
        ) {
          return false;
        }
      }
    }

    return true;
  });
}
