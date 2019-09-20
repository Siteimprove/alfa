import { Atomic } from "@siteimprove/alfa-act";
import { getTextAlternative, isExposed } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  InputType,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isElement } from "../helpers/predicate-builder";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R28: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r28.html",
  requirements: [
    { requirement: "wcag", criterion: "non-text-content", partial: true },
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
              isElement(builder =>
                builder
                  .withInputType(InputType.Image)
                  .withNamespace(document, Namespace.HTML)
              ),
              {
                flattened: true
              }
            ),
            element => {
              return isExposed(element, document, device);
            }
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
          getTextAlternative(target, document, device),
          textAlternative => {
            return {
              1: {
                holds: textAlternative !== null && textAlternative !== "",
                data: {
                  alt: textAlternative
                }
              }
            };
          }
        );
      }
    };
  }
};
