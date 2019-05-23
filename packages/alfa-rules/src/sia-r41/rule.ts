import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import {
  getRole,
  getTextAlternative,
  hasTextAlternative,
  isExposed,
  Roles
} from "@siteimprove/alfa-aria";
import { Map, Seq, Set } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  getRootNode,
  isElement,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isWhitespace } from "@siteimprove/alfa-unicode";
import { trim } from "@siteimprove/alfa-util";

const {
  map,
  Iterable: { filter, groupBy }
} = BrowserSpecific;

export const SIA_R41: Atomic.Rule<Device | Document, Iterable<Element>> = {
  id: "sanshikan:rules/sia-r41.html",
  requirements: [{ id: "wcag:link-purpose-link-only", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          groupBy(
            filter(
              querySelectorAll<Element>(document, document, isElement, {
                flattened: true
              }),
              element => {
                return map(isLink(element, document, device), isLink => {
                  if (!isLink) {
                    return false;
                  }

                  return map(
                    isExposed(element, document, device),
                    isExposed => {
                      if (!isExposed) {
                        return false;
                      }

                      return hasTextAlternative(element, document, device);
                    }
                  );
                });
              }
            ),
            element => {
              return map(
                getTextAlternative(element, document, device),
                textAlternative => {
                  return trim(textAlternative!, isWhitespace).toLowerCase();
                }
              );
            }
          ),
          groups => {
            return Map(groups)
              .toList()
              .flatMap(elements => {
                return Seq(elements)
                  .groupBy(element => {
                    return getRootNode(element, document);
                  })
                  .toList()
                  .map(elements => elements.toList())
                  .filter(elements => elements.size >= 2)
                  .map(elements => {
                    return {
                      aspect: document,
                      target: elements
                    };
                  });
              });
          }
        );
      },

      expectations: (aspect, target, question) => {
        const references = [
          ...Seq(target).reduce<Set<string | null>>((sources, target) => {
            switch (target.localName) {
              case "a":
              case "area":
                return sources.add(getAttribute(target, "href"));

              default:
                return sources.add(null);
            }
          }, Set())
        ];

        return {
          1: {
            holds:
              references.length === 1 && references[0] !== null
                ? true
                : question(QuestionType.Boolean, "embed-equivalent-resources")
          }
        };
      }
    };
  }
};

function isLink(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return BrowserSpecific.map(
    getRole(element, context, device),
    role => role === Roles.Link
  );
}
