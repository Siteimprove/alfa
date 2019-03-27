import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import {
  getRole,
  getTextAlternative,
  isExposed,
  Roles
} from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  getElementNamespace,
  getInputType,
  InputType,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

const { map } = BrowserSpecific;

export const SIA_R39: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r39.html",
  requirements: [{ id: "wcag:non-text-content", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll(document, document, isElement, {
          composed: true
        }).map(element => {
          const src = getAttribute(element, "src", {
            trim: true,
            lowerCase: true
          });

          if (src === null) {
            return {
              applicable: false,
              aspect: document,
              target: element
            };
          }

          const filename = getFilename(src);

          if (filename === "") {
            return {
              applicable: false,
              aspect: document,
              target: element
            };
          }

          return map(isImage(element, document, device), isImage => {
            if (!isImage) {
              return {
                applicable: false,
                aspect: document,
                target: element
              };
            }

            return map(isExposed(element, document, device), isExposed => {
              if (!isExposed) {
                return {
                  applicable: false,
                  aspect: document,
                  target: element
                };
              }

              return map(
                getTextAlternative(element, document, device),
                textAlternative => {
                  return {
                    applicable:
                      textAlternative !== null &&
                      textAlternative.toLowerCase() === filename,
                    aspect: document,
                    target: element
                  };
                }
              );
            });
          });
        });
      },

      expectations: (aspect, target, question) => {
        return {
          1: { holds: question(QuestionType.Boolean, "name-describes-image") }
        };
      }
    };
  }
};

function isImage(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  if (getInputType(element) === InputType.Image) {
    return true;
  }

  if (element.localName !== "img") {
    return false;
  }

  return map(getRole(element, context, device), role => role === Roles.Img);
}

function getFilename(path: string): string {
  const base = path.substring(path.lastIndexOf("/") + 1);
  const params = base.indexOf("?");

  if (params !== -1) {
    return base.substring(0, params).trim();
  }

  return base.trim();
}
