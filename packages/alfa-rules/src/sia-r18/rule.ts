import { Atomic } from "@siteimprove/alfa-act";
import { Attributes, getRole, isExposed, Roles } from "@siteimprove/alfa-aria";
import { List, Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  getOwnerElement,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { values } from "@siteimprove/alfa-util";

import { isAllowedAttribute } from "../helpers/is-allowed-attribute";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R18: Atomic.Rule<Device | Document, Attribute> = {
  id: "sanshikan:rules/sia-r18.html",
  requirements: [
    { requirement: "wcag", criterion: "parsing", partial: true },
    { requirement: "wcag", criterion: "name-role-value", partial: true }
  ],
  evaluate: ({ device, document }) => {
    const attributeNames = new Set(
      values(Attributes).map(attribute => attribute.name)
    );

    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll(document, document, isElement, {
              composed: true
            }),
            element => {
              return isExposed(element, document, device);
            }
          ),
          elements => {
            return Seq(elements)
              .reduce<List<Attribute>>((attributes, element) => {
                return attributes.concat(
                  Array.from(element.attributes).filter(attribute => {
                    return attributeNames.has(attribute.localName);
                  })
                );
              }, List())
              .map(attribute => {
                return {
                  applicable: true,
                  aspect: document,
                  target: attribute
                };
              });
          }
        );
      },

      expectations: (aspect, target) => {
        const owner = getOwnerElement(target, document)!;

        const globalAttributeNames = new Set(
          Roles.Roletype.supported!(owner, document, device).map(
            attribute => attribute.name
          )
        );

        return map(getRole(owner, document, device), role => {
          let isAllowed: boolean;

          if (role !== null) {
            isAllowed = isAllowedAttribute(
              owner,
              document,
              target.localName,
              role,
              device
            );
          } else {
            isAllowed = globalAttributeNames.has(target.localName);
          }

          return {
            1: { holds: isAllowed }
          };
        });
      }
    };
  }
};
