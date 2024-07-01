import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type {
  Attribute} from "@siteimprove/alfa-dom";
import {
  Element,
  Namespace,
  Node,
  Query,
  Text,
} from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Option } from "@siteimprove/alfa-option";
import { None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { String } from "@siteimprove/alfa-string";
import { Style } from "@siteimprove/alfa-style";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasNonEmptyAccessibleName, isIncludedInTheAccessibilityTree } = DOM;
const { hasAttribute, hasName, hasNamespace, isElement } = Element;
const { isEmpty } = Iterable;
const { not, or } = Predicate;
const { and, test } = Refinement;
const { isVisible } = Style;
const { isText } = Text;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r7",
  requirements: [Criterion.of("3.1.2"), Technique.of("H58")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        function* visit(
          node: Node,
          lang: Option<Attribute>,
        ): Iterable<Attribute> {
          if (test(and(isElement, hasAttribute("lang", not(isEmpty))), node)) {
            lang = node.attribute("lang");
          }
          if (lang.isSome()) {
            const isVisibleText = and(
              isText,
              and(
                or(isVisible(device), isIncludedInTheAccessibilityTree(device)),
                (text: Text) => !String.isWhitespace(text.data, false),
              ),
            );

            const isElementWithAccessibleName = and(
              isElement,
              hasNonEmptyAccessibleName(device),
            );

            if (test(or(isVisibleText, isElementWithAccessibleName), node)) {
              yield* lang;
            }
          }

          for (const child of node.children(Node.flatTree)) {
            yield* visit(child, lang);
          }
        }

        return getElementDescendants(document, Node.fullTree)
          .filter(and(hasNamespace(Namespace.HTML), hasName("body")))
          .flatMap((element) => Sequence.from(visit(element, None)))
          .distinct();
      },

      expectations(target) {
        return {
          1: expectation(
            Language.parse(target.value).isOk(),
            () => Outcomes.HasValidLanguage,
            () => Outcomes.HasNoValidLanguage,
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const HasValidLanguage = Ok.of(
    Diagnostic.of(`The \`lang\` attribute has a valid primary language subtag`),
  );

  export const HasNoValidLanguage = Err.of(
    Diagnostic.of(
      `The \`lang\` attribute does not have a valid primary language subtag`,
    ),
  );
}
