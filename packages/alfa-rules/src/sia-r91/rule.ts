import { Rule } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Text } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Property, Style } from "@siteimprove/alfa-style";

import { TextSpacing } from "../common/outcome/text-spacing";

import { expectation } from "../common/expectation";
import {
  hasCascadedStyle,
  hasComputedStyle,
  hasInlineStyleProperty,
  isVisible,
  isWhitespace,
} from "../common/predicate";

const { isElement, hasNamespace } = Element;
const { not, or, test } = Predicate;
const { and } = Refinement;
const { isText } = Text;

const property = "letter-spacing";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r91",
  requirements: [Criterion.of("1.4.12")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ nested: true, flattened: true })
          .filter(
            and(
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
                  .inclusiveDescendants({ flattened: true })
                  .filter(
                    and(isText, (text) => test(not(isWhitespace), text.data))
                  )
                  .every((text) =>
                    text
                      .parent({ flattened: true })
                      .filter(isElement)
                      .some(
                        or(
                          isWideEnough(
                            device,
                            property,
                            (letterSpacing) => (fontSize) =>
                              letterSpacing.value >= 0.12 * fontSize.value
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
                () => Outcomes.GoodText,
                () => Outcomes.Important
              )
          ),
        };
      },
    };
  },
});

export const Outcomes = TextSpacing(property);

function isImportant(
  device: Device,
  property: Property.Name
): Predicate<Element> {
  return hasComputedStyle(
    property,
    (_, source) => source.some((declaration) => declaration.important),
    device
  );
}

function isWideEnough<N extends Property.Name>(
  device: Device,
  property: N,
  predicate: (
    value: Style.Computed<N>
  ) => Predicate<Style.Computed<"font-size">>
): Predicate<Element> {
  return (element) =>
    hasComputedStyle(
      property,
      (value) =>
        hasComputedStyle("font-size", predicate(value), device)(element),
      device
    )(element);
}

function hasCascadedValueDeclaredInInlineStyleOf(
  context: Element,
  device: Device,
  name: Property.Name
): Predicate<Element> {
  return hasCascadedStyle(
    name,
    (_, source) =>
      source.some((cascaded) =>
        context.style.some((block) =>
          block
            // We need reference equality here, not .equals as we want to check if the cascaded
            // value is exactly the declared one, not just a similar one.
            .declaration((declared) => cascaded === declared)
            .isSome()
        )
      ),
    device
  );
}
