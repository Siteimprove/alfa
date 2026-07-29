import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation, Question } from "../common/act/index.ts";

import { Scope, Stability } from "../tags/index.ts";

const { hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

/**
 * This rule always asks whether the image contains text and, if so, whether any
 * of the exceptions apply.
 */
export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r118",
  requirements: [
    Criterion.of("1.4.5"),
    Criterion.of("1.4.9"),
    EAA.of("9.1.4.5"),
  ],
  tags: [Scope.Component, Stability.Experimental],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            hasRole(device, "img"),
            isIncludedInTheAccessibilityTree(device),
          ),
        );
      },

      expectations(target) {
        const isRedundant = () =>
          Question.of("is-image-text-redundant", target).map((redundant) =>
            expectation(
              redundant,
              () => Outcomes.IsRedundant,
              () => Outcomes.IsImageOfText,
            ),
          );

        const isEssential = () =>
          Question.of("is-image-text-essential", target).map((essential) =>
            expectation<Question.Metadata, Element, Element, -1>(
              essential,
              () => Outcomes.IsEssential,
              isRedundant,
            ),
          );

        const isIncidental = () =>
          Question.of("is-image-text-incidental", target).map((incidental) =>
            expectation<Question.Metadata, Element, Element, 0>(
              incidental,
              () => Outcomes.IsIncidental,
              isEssential,
            ),
          );

        const isDecorative = () =>
          Question.of("is-image-text-decorative", target).map((decorative) =>
            expectation<Question.Metadata, Element, Element, 1>(
              decorative,
              () => Outcomes.IsDecorative,
              isIncidental,
            ),
          );

        return {
          1: Question.of("does-image-contain-human-language-text", target).map(
            (humanLanguage) =>
              expectation<Question.Metadata, Element, Element, 2>(
                humanLanguage,
                isDecorative,
                () => Outcomes.HasNoHumanLanguageText,
              ),
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
  export const HasNoHumanLanguageText = Ok.of(
    Diagnostic.of(
      `The image does not contain text that expresses anything in a human language`,
    ),
  );

  export const IsDecorative = Ok.of(
    Diagnostic.of(`The image with text is purely decorative`),
  );

  export const IsIncidental = Ok.of(
    Diagnostic.of(`The text is not a significant part of the image`),
  );

  export const IsEssential = Ok.of(
    Diagnostic.of(`The presentation of the text is essential`),
  );

  export const IsRedundant = Ok.of(
    Diagnostic.of(
      `The same information is available as regular text in the same page`,
    ),
  );

  export const IsImageOfText = Err.of(
    Diagnostic.of(
      `The image contains text and none of the exceptions apply`,
    ),
  );
}
