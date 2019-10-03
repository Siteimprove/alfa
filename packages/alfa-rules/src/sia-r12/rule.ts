import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isExposed, Roles } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getInputType,
  InputType,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isElement } from "../helpers/predicate-builder";

import { EN } from "./locales/en";

const {
  map,
  BinOp: { and },
  Iterable: { filter }
} = BrowserSpecific;

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
            querySelectorAll<Element>(
              document,
              document,
              node =>
                isElement()(node) && getInputType(node) !== InputType.Image,
              {
                flattened: true
              }
            ),
            element =>
              and(
                isElement(builder =>
                  builder
                    .withNamespace(document, Namespace.HTML)
                    .withRole(device, document, Roles.Button)
                )(element),
                isExposed(element, document, device)
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
