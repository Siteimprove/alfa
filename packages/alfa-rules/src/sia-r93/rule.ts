import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { TextSpacing } from "../common/outcome/text-spacing";

import { expectation } from "../common/act/expectation";

import { isWhitespace, isWideEnough } from "../common/predicate";
import { Scope } from "../tags";

const { not, or, test } = Predicate;
const { and } = Refinement;
const { isElement, hasNamespace } = Element;
const {
  hasCascadedValueDeclaredInInlineStyleOf,
  hasInlineStyleProperty,
  isImportant,
  isVisible,
} = Style;
const { isText } = Text;

const property = "line-height";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r93",
  requirements: [Criterion.of("1.4.12")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants(Node.fullTree)
          .filter(
            Refinement.and(
              isElement,
              and(
                hasNamespace(Namespace.HTML),
                isVisible(device),
                hasInlineStyleProperty(property)
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            !isImportant(device, property)(target),
            () => Outcomes.NotImportant,
            () =>
              expectation(
                // We can't really cache that bit because the context of
                // hasCascadedValueDeclaredInInlineStyleOf is the test target
                // and therefore won't be shared between targets.
                // We could try to cache something like
                // element => {all elements whose cascaded `letter-spacing` is
                // declared in the same place} but that is not transitive (e.g.
                // div > p > div could have both <div> using the same source,
                // but not the <p>.
                // In the end, we assume that 1. !important properties in style
                // attributes are not frequent (few test targets); and 2. this
                // mostly happens close to the bottom of the tree (few
                // descendants). So that we can hopefully afford to pay the
                // price each time.
                target
                  .inclusiveDescendants(Node.flatTree)
                  .filter(
                    and(isText, (text) => test(not(isWhitespace), text.data))
                  )
                  .every((text) =>
                    text
                      .parent(Node.flatTree)
                      .filter(isElement)
                      .some(
                        or(
                          isWideEnough(
                            device,
                            property,
                            (lineHeight) => (fontSize) => {
                              switch (lineHeight.type) {
                                case "number":
                                  return lineHeight.value >= 1.5;

                                case "length":
                                  return (
                                    lineHeight.value >= 1.5 * fontSize.value
                                  );

                                default:
                                  return false;
                              }
                            }
                          ),
                          not(
                            hasCascadedValueDeclaredInInlineStyleOf(
                              target,
                              device,
                              property
                            )
                          )
                        )
                      )
                  ),
                () => Outcomes.WideEnough,
                () => Outcomes.Important
              )
          ),
        };
      },
    };
  },
});

export const Outcomes = TextSpacing(property);
