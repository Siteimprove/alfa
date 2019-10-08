import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isExposed, Roles } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific, Predicate } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  InputType,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";

import {
  inputTypeIs,
  isElement,
  namespaceIs,
  roleIs
} from "../helpers/predicates";

import { EN } from "./locales/en";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;
const { not } = Predicate;

export const SIA_R12: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r12.html",
  locales: [EN],
  requirements: [
    { requirement: "wcag", criterion: "name-role-value", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll(
              document,
              document,
              Predicate.from(isElement.and(not(inputTypeIs(InputType.Image)))),
              {
                flattened: true
              }
            ),
            Predicate.from(
              isElement
                .and(namespaceIs(document, Namespace.HTML))
                .and(roleIs(document, device, Roles.Button))
                .and(element => isExposed(element, document, device))
            )
          ),
          elements => {
            return Seq(elements).map(element => {
              return {
                aspect: document,
                target: element
              };
            });
          }
        );
      },

      expectations: (aspect, target) => {
        return map(
          hasTextAlternative(target, document, device),
          hasTextAlternative => {
            return {
              1: { holds: hasTextAlternative }
            };
          }
        );
      }
    };
  }
};
