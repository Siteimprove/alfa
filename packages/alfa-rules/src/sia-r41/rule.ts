import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import {
  getTextAlternative,
  hasTextAlternative,
  isExposed,
  Roles
} from "@siteimprove/alfa-aria";
import { Map, Seq, Set } from "@siteimprove/alfa-collection";
import { BrowserSpecific, Predicate } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  getRootNode,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isWhitespace } from "@siteimprove/alfa-unicode";
import { trim } from "@siteimprove/alfa-util";

import { isElement, roleIs } from "../helpers/predicates";

const {
  map,
  Iterable: { filter, groupBy }
} = BrowserSpecific;

export const SIA_R41: Atomic.Rule<Device | Document, Iterable<Element>> = {
  id: "sanshikan:rules/sia-r41.html",
  locales: [EN],
  requirements: [
    { requirement: "wcag", criterion: "link-purpose-link-only", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          groupBy(
            filter(
              querySelectorAll(document, document, Predicate.from(isElement), {
                flattened: true
              }),
              Predicate.from(
                isElement
                  .and(roleIs(document, device, Roles.Link))
                  .and(element => isExposed(element, document, device))
                  .and(element => hasTextAlternative(element, document, device))
              )
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
