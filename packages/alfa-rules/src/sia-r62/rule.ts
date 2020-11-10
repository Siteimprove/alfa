import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isTabbable } from "../common/predicate/is-tabbable";
import { isVisible } from "../common/predicate/is-visible";

const { isElement, hasName, hasNamespace } = Element;
const { isText } = Text;
const { and, not, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r62.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document, false);

        function* visit(node: Node, collect: boolean): Iterable<Element> {
          if (isElement(node)) {
            // If the element is a semantic link, it might be applicable.
            if (
              test(
                hasRole((role) => role.is("link")),
                node
              )
            ) {
              if (
                collect &&
                node
                  .descendants({ flattened: true })
                  .some(and(isText, isVisible(device)))
              ) {
                return yield node;
              }
            }

            // Otherwise, if the element is a <p> element with non-link text
            // content then start collecting applicable elements.
            else if (test(and(hasName("p"), hasNonLinkText(device)), node)) {
              collect = true;
            }
          }

          const children = node.children({
            flattened: true,
            nested: true,
          });

          for (const child of children) {
            yield* visit(child, collect);
          }
        }
      },

      expectations(target) {
        return {};
      },
    };
  },
});

export namespace Outcomes {}

function hasNonLinkText(device: Device): Predicate<Element> {
  return function hasNonLinkText(element) {
    const children = element.children({
      flattened: true,
    });

    if (children.some(and(isText, isVisible(device)))) {
      return true;
    }

    return children
      .filter(isElement)
      .reject(hasRole((role) => role.is("link")))
      .some(hasNonLinkText);
  };
}
