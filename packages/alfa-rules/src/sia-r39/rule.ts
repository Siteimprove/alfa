import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { getTextAlternative, isExposed, Roles } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  InputType,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { ElementChecker } from "../helpers/element-checker";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R39: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r39.html",
  requirements: [
    { requirement: "wcag", criterion: "non-text-content", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll(document, document, isElement, {
              flattened: true
            }),
            element => {
              const src = getAttribute(element, "src", {
                trim: true,
                lowerCase: true
              });

              if (src === null) {
                return false;
              }

              const filename = getFilename(src);

              if (filename === "") {
                return false;
              }

              return map(isImage(element, document, device), isImage => {
                if (!isImage) {
                  return false;
                }

                return map(isExposed(element, document, device), isExposed => {
                  if (!isExposed) {
                    return false;
                  }

                  return map(
                    getTextAlternative(element, document, device),
                    textAlternative => {
                      return (
                        textAlternative !== null &&
                        textAlternative.toLowerCase() === filename
                      );
                    }
                  );
                });
              });
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
  const imgByType = new ElementChecker()
    .withInputType(InputType.Image)
    .withContext(context)
    .withNamespace(Namespace.HTML)
    .evaluate(element) as boolean;
  const imgByNameAndRole = new ElementChecker()
    .withName("img")
    .withContext(context)
    .withNamespace(Namespace.HTML)
    .withRole(device, Roles.Img)
    .evaluate(element);

  return imgByType ? true : imgByNameAndRole;
}

function getFilename(path: string): string {
  const base = path.substring(path.lastIndexOf("/") + 1);
  const params = base.indexOf("?");

  if (params !== -1) {
    return base.substring(0, params).trim();
  }

  return base.trim();
}
