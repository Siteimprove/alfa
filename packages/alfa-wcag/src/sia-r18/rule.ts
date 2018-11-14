import { Atomic } from "@siteimprove/alfa-act";
import { Attributes, getRole, Role, Roles } from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  Element,
  getOwnerElement,
  isElement,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { values } from "@siteimprove/alfa-util";

function concat<T>(a: Array<T>, b: Array<T>): Array<T> {
  return a.concat(b);
}

export const SIA_R18: Atomic.Rule<Device | Document, Attribute> = {
  id: "sanshikan:rules/sia-r18.html",
  requirements: [
    { id: "wcag:parsing", partial: true },
    { id: "wcag:name-role-value", partial: true }
  ],
  definition: (applicability, expectations, { device, document }) => {
    const attributeNames = new Set(
      values(Attributes).map(attribute => attribute.name)
    );

    applicability(() =>
      querySelectorAll(document, document, isElement)
        .map(element =>
          Array.from(element.attributes).filter(attribute =>
            attributeNames.has(attribute.localName)
          )
        )
        .reduce(concat, [])
    );

    expectations((target, expectation) => {
      const owner = getOwnerElement(target, document)!;

      const globalAttributeNames = new Set(
        Roles.Roletype.supported!(owner, document, device).map(
          attribute => attribute.name
        )
      );

      expectation(
        1,
        some(getRole(owner, document, device), role => {
          if (role !== null) {
            return isAllowedAttribute(owner, document, device, target.localName, role);
          }

          return globalAttributeNames.has(target.localName);
        })
      );
    });
  }
};

function isAllowedAttribute(
  element: Element,
  context: Node,
  device: Device,
  attributeName: string,
  role: Role
): boolean {
  const required =
    role.required === undefined ? [] : role.required(element, context, device);

  for (const attribute of required) {
    if (attribute.name === attributeName) {
      return true;
    }
  }

  const supported =
    role.supported === undefined ? [] : role.supported(element, context, device);

  for (const attribute of supported) {
    if (attribute.name === attributeName) {
      return true;
    }
  }

  const inherits =
    role.inherits === undefined ? [] : role.inherits(element, context, device);

  for (const role of inherits) {
    if (isAllowedAttribute(element, context, device, attributeName, role)) {
      return true;
    }
  }

  return false;
}
