import { Atomic } from "@siteimprove/alfa-act";
import {
  getTextAlternative,
  hasTextAlternative,
  isExposed
} from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  getElementNamespace,
  getRootNode,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isWhitespace } from "@siteimprove/alfa-unicode";
import { trim } from "@siteimprove/alfa-util";

const { find, map } = BrowserSpecific;

export const SIA_R15: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r15.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll<Element>(
          document,
          document,
          node => {
            return isElement(node) && isIframe(node, document);
          },
          {
            flattened: true
          }
        ).map(element => {
          return map(isExposed(element, document, device), isExposed => {
            if (!isExposed) {
              return {
                applicable: false,
                aspect: document,
                target: element
              };
            }

            return map(
              hasTextAlternative(element, document, device),
              hasTextAlternative => {
                return {
                  applicable: hasTextAlternative,
                  aspect: document,
                  target: element
                };
              }
            );
          });
        });
      },

      expectations: (aspect, target) => {
        const src = getAttribute(target, "src");
        const root = getRootNode(target, document);

        return map(
          getTextAlternative(target, document, device),
          textAlternative => {
            textAlternative = trim(
              textAlternative!,
              isWhitespace
            ).toLowerCase();

            return map(
              find(
                querySelectorAll<Element>(root, document, node => {
                  return isElement(node) && isIframe(node, document);
                }),
                candidate => {
                  if (target === candidate) {
                    return false;
                  }

                  if (src === getAttribute(candidate, "src")) {
                    return false;
                  }

                  return map(
                    isExposed(candidate, document, device),
                    isExposed => {
                      if (!isExposed) {
                        return false;
                      }

                      return map(
                        getTextAlternative(candidate, document, device),
                        otherTextAlternative => {
                          if (otherTextAlternative === null) {
                            return false;
                          }

                          return (
                            textAlternative ===
                            trim(
                              otherTextAlternative,
                              isWhitespace
                            ).toLowerCase()
                          );
                        }
                      );
                    }
                  );
                }
              ),
              duplicate => {
                return {
                  1: { holds: duplicate === null }
                };
              }
            );
          }
        );
      }
    };
  }
};

function isIframe(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "iframe"
  );
}
