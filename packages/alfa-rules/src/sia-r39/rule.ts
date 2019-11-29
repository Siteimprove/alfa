import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { getTextAlternative, isExposed, Roles } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific, Predicate } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  InputType,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";

import {
  inputTypeIs,
  isElement,
  nameIs,
  namespaceIs,
  roleIs
} from "../helpers/predicates";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R39: Atomic.Rule<Device | Document, Element> = {
  id: "ttps://siteimprove.github.io/sanshikan/rules/sia-r39.html",
  requirements: [
    { requirement: "wcag", criterion: "non-text-content", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll(document, document, Predicate.from(isElement), {
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

              return Predicate.test(
                element,
                isElement
                  .and(namespaceIs(document, Namespace.HTML))
                  .and(
                    nameIs("img")
                      .or(roleIs(document, device, Roles.Img))
                      .or(inputTypeIs(InputType.Image))
                  )
                  .and(element => isExposed(element, document, device))
                  .and(element =>
                    map(
                      getTextAlternative(element, document, device),
                      textAlternative => {
                        return (
                          textAlternative !== null &&
                          textAlternative.toLowerCase() === filename
                        );
                      }
                    )
                  )
              );
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

function getFilename(path: string): string {
  const base = path.substring(path.lastIndexOf("/") + 1);
  const params = base.indexOf("?");

  if (params !== -1) {
    return base.substring(0, params).trim();
  }

  return base.trim();
}
