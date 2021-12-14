import { Rule } from "@siteimprove/alfa-act";
import { Element, Text, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { contrast } from "../common/expectation/contrast";
import { getBackground, getForeground } from "../common/expectation/get-colors";

import {
  hasRole,
  isPerceivable,
  isLargeText,
  isSemanticallyDisabled,
} from "../common/predicate";

import { Contrast as Outcomes } from "../common/outcome/contrast";

import { Question } from "../common/question";

import { Contrast as Diagnostic } from "../common/diagnostic/contrast";
import { Scope } from "../tags/scope";

const { flatMap, map } = Iterable;
const { or, not } = Predicate;
const { and, test } = Refinement;
const { max } = Math;
const { isElement } = Element;
const { isText } = Text;

export default Rule.Atomic.of<Page, Text, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r66",
  requirements: [Criterion.of("1.4.6")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document);

        function* visit(node: Node): Iterable<Text> {
          if (
            test(
              and(
                isElement,
                or(
                  not(Element.hasNamespace(Namespace.HTML)),
                  hasRole(device, (role) => role.isWidget()),
                  and(hasRole(device, "group"), isSemanticallyDisabled)
                )
              ),
              node
            )
          ) {
            return;
          }

          if (test(and(isText, isPerceivable(device)), node)) {
            yield node;
          }

          const children = node.children({ flattened: true, nested: true });

          for (const child of children) {
            yield* visit(child);
          }
        }
      },

      expectations(target) {
        const foregrounds = Question.of(
          "color[]",
          "foreground-colors",
          "What are the foreground colors of the text node?",
          target
        );

        const backgrounds = Question.of(
          "color[]",
          "background-colors",
          "What are the background colors of the text node?",
          target
        );

        const result = foregrounds.map((foregrounds) =>
          backgrounds.map((backgrounds) => {
            const pairings = [
              ...flatMap(foregrounds, (foreground) =>
                map(backgrounds, (background) =>
                  Diagnostic.Pairing.of(
                    foreground,
                    background,
                    contrast(foreground, background)
                  )
                )
              ),
            ];

            const highest = pairings.reduce(
              (lowest, pairing) => max(lowest, pairing.contrast),
              0
            );

            const threshold = isLargeText(device)(target) ? 4.5 : 7;

            return expectation(
              highest >= threshold,
              () =>
                Outcomes.HasSufficientContrast(highest, threshold, pairings),
              () =>
                Outcomes.HasInsufficientContrast(highest, threshold, pairings)
            );
          })
        );

        const parent = target.parent({ flattened: true }).get() as Element;

        return {
          1: result
            .answerIf(getForeground(parent, device))
            .map((askBackground) =>
              askBackground.answerIf(getBackground(parent, device))
            ),
        };
      },
    };
  },
});
