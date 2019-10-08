import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import {
  getTextAlternative,
  hasTextAlternative,
  isExposed
} from "@siteimprove/alfa-aria";
import { Map, Seq, Set } from "@siteimprove/alfa-collection";
import { BrowserSpecific, Predicate } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  getRootNode,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isWhitespace } from "@siteimprove/alfa-unicode";
import { trim } from "@siteimprove/alfa-util";

import { isElement, nameIs, namespaceIs } from "../helpers/predicates";

const {
  map,
  Iterable: { filter, groupBy }
} = BrowserSpecific;

export const SIA_R15: Atomic.Rule<Device | Document, Iterable<Element>> = {
  id: "sanshikan:rules/sia-r15.html",
  requirements: [
    { requirement: "wcag", criterion: "name-role-value", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          groupBy(
            filter(
              querySelectorAll(
                document,
                document,
                Predicate.from(
                  isElement
                    .and(namespaceIs(document, Namespace.HTML))
                    .and(nameIs("iframe"))
                ),
                {
                  flattened: true
                }
              ),
              element => {
                return map(isExposed(element, document, device), isExposed => {
                  if (!isExposed) {
                    return false;
                  }

                  return hasTextAlternative(element, document, device);
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
        const sources = Seq(target).reduce<Set<string | null>>(
          (sources, target) => {
            return sources.add(getAttribute(target, "src"));
          },
          Set()
        );

        return {
          1: {
            holds:
              sources.size === 1
                ? true
                : question(QuestionType.Boolean, "embed-equivalent-resources")
          }
        };
      }
    };
  }
};
