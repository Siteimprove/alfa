import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isExposed } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific, Predicate } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";

import { isElement, nameIs, namespaceIs } from "../helpers/predicates";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R13: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r13.html",
  requirements: [
    {
      requirement: "wcag",
      criterion: "link-purpose-in-context",
      partial: true
    },
    {
      requirement: "wcag",
      criterion: "name-role-value",
      partial: true
    }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll(document, document, Predicate.from(isElement)),
            Predicate.from(
              isElement
                .and(namespaceIs(document, Namespace.HTML))
                .and(nameIs("iframe"))
                .and(element => isExposed(element, document, device))
            )
          ),
          elements => {
            return Seq(elements).map(element => {
              return {
                applicable: true,
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
