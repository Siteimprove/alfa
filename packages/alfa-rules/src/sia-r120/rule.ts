import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/index.ts";
import { BestPractice } from "../requirements/index.ts";

import { Scope, Stability } from "../tags/index.ts";

const { hasNamespace } = Element;
const { and } = Predicate;
const { isRendered } = Style;
const { getElementDescendants } = Query;

/**
 * This rule checks that no element declares an access key that another element
 * also declares.
 *
 * Two elements competing for one key means at most one of them can be reached
 * by it, and which one wins is left to the user agent.
 *
 * Elements that are not rendered are left out, since their access keys cannot
 * be activated, and a key declared only on such an element competes with
 * nothing.
 *
 * {@link https://html.spec.whatwg.org/multipage/interaction.html#the-accesskey-attribute}
 */
export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r120",
  requirements: [BestPractice.of("accesskey-unique")],
  tags: [Scope.Page, Stability.Stable],
  evaluate({ device, document }) {
    const elements = getElementDescendants(document, Node.fullTree)
      .filter(and(hasNamespace(Namespace.HTML), declaresAccesskey))
      .filter(isRendered(device));

    const accessKeyElementPairs = new Map<string, Array<Element>>();

    for (const element of elements) {
      for (const key of accesskeys(element)) {
        const elementsForKey = accessKeyElementPairs.get(key) ?? [];

        elementsForKey.push(element);
        accessKeyElementPairs.set(key, elementsForKey);
      }
    }

    return {
      applicability() {
        return elements;
      },

      expectations(target) {
        const contested = accesskeys(target).filter(
          (key) => (accessKeyElementPairs.get(key)?.length ?? 0) > 1,
        );

        return {
          1: expectation(
            contested.isEmpty(),
            () => Outcomes.HasUniqueAccesskeys,
            () => Outcomes.HasNonUniqueAccesskeys(contested),
          ),
        };
      },
    };
  },
});

function accesskeys(element: Element): Sequence<string> {
  return Sequence.from(element.attribute("accesskey")).flatMap((attribute) =>
    attribute.tokens().map((token) => token.toLowerCase()),
  );
}

const declaresAccesskey: Predicate<Element> = (element) =>
  !accesskeys(element).isEmpty();

/**
 * @public
 */
export namespace Outcomes {
  export const HasUniqueAccesskeys = Ok.of(
    Diagnostic.of(
      `No access key of the element is declared by another element.`,
    ),
  );

  export const HasNonUniqueAccesskeys = (keys: Iterable<string>) =>
    Err.of(
      Diagnostic.of(
        `More than one element declares the access key ${Sequence.from(keys)
          .map((key) => `"${key}"`)
          .join(", ")}.`,
      ),
    );
}
