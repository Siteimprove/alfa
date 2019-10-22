import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import {
  Category,
  getRole,
  getRoleCategory,
  getTextAlternative,
  hasNameFrom
} from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  isText,
  isVisible,
  Namespace,
  Node,
  querySelectorAll,
  traverseNode
} from "@siteimprove/alfa-dom";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R14: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r14.html",
  requirements: [
    { requirement: "wcag", criterion: "label-in-name", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll<Element>(document, document, node => {
              return (
                isElement(node) &&
                isHtmlOrSvgElement(node, document) &&
                hasVisibleTextContent(node, document, device)
              );
            }),
            element => {
              return map(isWidget(element, document, device), isWidget => {
                if (!isWidget) {
                  return false;
                }

                return map(
                  isContentLabelable(element, document, device),
                  isContentLabelable => {
                    if (!isContentLabelable) {
                      return false;
                    }

                    return map(
                      getTextAlternative(element, document, device),
                      textAlternative => {
                        return textAlternative !== null;
                      }
                    );
                  }
                );
              });
            }
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

      expectations: (aspect, target, question) => {
        const visibleTextContent = getVisibleTextContent(
          target,
          document,
          device
        );

        return map(
          getTextAlternative(target, document, device),
          textAlternative => {
            let holds: boolean | null = normalize(textAlternative!).includes(
              visibleTextContent
            );

            if (!holds) {
              const isHumanLanguage = question(
                QuestionType.Boolean,
                "is-human-language"
              );

              holds = isHumanLanguage === null ? null : !isHumanLanguage;
            }

            return {
              1: { holds }
            };
          }
        );
      }
    };
  }
};

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getVisibleTextContent(
  element: Element,
  context: Node,
  device: Device
): string {
  let textContent = "";

  [
    ...traverseNode(
      element,
      context,
      {
        *enter(node) {
          if (isText(node) && isVisible(node, context, device)) {
            textContent += node.data;
          }
        }
      },
      {
        flattened: true
      }
    )
  ];

  return normalize(textContent);
}

function hasVisibleTextContent(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return getVisibleTextContent(element, context, device) !== "";
}

function isHtmlOrSvgElement(element: Element, context: Node): boolean {
  switch (getElementNamespace(element, context)) {
    case Namespace.HTML:
    case Namespace.SVG:
      return true;
  }

  return false;
}

function isWidget(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getRoleCategory(element, context, device), category => {
    return category === Category.Widget;
  });
}

function isContentLabelable(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getRole(element, context, device), role => {
    return role !== null && hasNameFrom(role, "contents");
  });
}
