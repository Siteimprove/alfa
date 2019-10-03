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
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isElement } from "../helpers/predicate-builder";

const {
  map,
  //  BinOp: { and },
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
            querySelectorAll(document, document, isElement(), {
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

              return isElement(builder =>
                builder
                  .withNamespace(document, Namespace.HTML)
                  .browserSpecific()
                  .and(
                    isElement(builder =>
                      builder
                        .withName("img")
                        .withRole(device, document, Roles.Img)
                        .or(
                          isElement(builder =>
                            builder.withInputType(InputType.Image)
                          )
                        )
                    )
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
              )(element);
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
