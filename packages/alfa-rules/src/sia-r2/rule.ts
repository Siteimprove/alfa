import { Atomic } from "@siteimprove/alfa-act";
import {
  getTextAlternative,
  hasTextAlternative,
  isExposed,
  Roles
} from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isElement } from "../helpers/predicate-builder";

import { EN } from "./locales/en";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R2: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r2.html",
  requirements: [
    { requirement: "wcag", criterion: "non-text-content", partial: true }
  ],
  locales: [EN],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll(document, document, isElement(), {
              flattened: true
            }),
            isElement(builder =>
              builder
                .withNamespace(document, Namespace.HTML)
                .browserSpecific()
                .and(
                  isElement(builder =>
                    builder
                      .withRole(device, document, Roles.Img)
                      .and(element => isExposed(element, document, device))
                      .or(isElement(builder => builder.withName("img")))
                  )
                )
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
            return map(
              getTextAlternative(target, document, device),
              textAlternative => {
                return map(
                  isElement(builder =>
                    builder.withRole(
                      device,
                      document,
                      Roles.None,
                      Roles.Presentation
                    )
                  )(target),
                  isDecorative => {
                    return {
                      1: {
                        holds: isDecorative || hasTextAlternative,
                        data: {
                          alt: textAlternative,
                          decorative: isDecorative
                        }
                      }
                    };
                  }
                );
              }
            );
          }
        );
      }
    };
  }
};
