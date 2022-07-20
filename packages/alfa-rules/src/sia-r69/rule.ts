import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node as ariaNode } from "@siteimprove/alfa-aria";
import { Element, Text, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Question } from "../common/act/question";

import { getBackground, getForeground } from "../common/dom/get-colors";

import { isLargeText } from "../common/predicate";

import { Contrast as Diagnostic } from "../common/diagnostic/contrast";
import { contrast } from "../common/expectation/contrast";
import { Contrast as Outcomes } from "../common/outcome/contrast";

import { Scope } from "../tags";
import { Set } from "@siteimprove/alfa-set";
import { Sequence } from "@siteimprove/alfa-sequence";

const { hasRole, isPerceivableForAll, isSemanticallyDisabled } = DOM;
const { hasNamespace, isElement } = Element;
const { flatMap, map } = Iterable;
const { max } = Math;
const { or, not } = Predicate;
const { and, test } = Refinement;
const { isText } = Text;

export default Rule.Atomic.of<Page, Text, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r69",
  requirements: [Criterion.of("1.4.3"), Criterion.of("1.4.6")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        // Gather all aria-disabled widgets or groups on the document
        let disabledWidgetTexts: Set<Text> = Set.from(
          document
            .descendants(Node.fullTree)
            .filter((node) =>
              test(
                and(
                  isElement,
                  and(
                    or(
                      hasRole(device, (role) => role.isWidget()),
                      hasRole(device, "group")
                    ),
                    isSemanticallyDisabled
                  )
                ),
                node
              )
            )
            .flatMap((element) =>
              ariaNode
                .from(element, device)
                .name.map((name) =>
                  Sequence.fromIterable(name.sourceNodes()).filter(isText)
                )
                .getOr(Sequence.empty<Text>())
            )
        );
        return visit(document);

        function* visit(node: Node): Iterable<Text> {
          if (
            test(
              and(
                isElement,
                or(
                  not(hasNamespace(Namespace.HTML)),
                  hasRole(device, (role) => role.isWidget()),
                  and(hasRole(device, "group"), isSemanticallyDisabled)
                )
              ),
              node
            )
          ) {
            return;
          }

          if (
            test(and(isText, isPerceivableForAll(device)), node) &&
            !disabledWidgetTexts.has(node)
          ) {
            yield node;
          }

          for (const child of node.children(Node.fullTree)) {
            yield* visit(child);
          }
        }
      },

      expectations(target) {
        const foregrounds = Question.of("foreground-colors", target);

        const backgrounds = Question.of("background-colors", target);

        const result = foregrounds.map((foregrounds) =>
          backgrounds.map((backgrounds) => {
            const pairings = [
              ...flatMap(foregrounds, (foreground) =>
                map(backgrounds, (background) =>
                  Diagnostic.Pairing.of<["foreground", "background"]>(
                    ["foreground", foreground],
                    ["background", background],
                    contrast(foreground, background)
                  )
                )
              ),
            ];

            const highest = pairings.reduce(
              (lowest, pairing) => max(lowest, pairing.contrast),
              0
            );

            const threshold = isLargeText(device)(target) ? 3 : 4.5;

            return expectation(
              highest >= threshold,
              () =>
                Outcomes.HasSufficientContrast(highest, threshold, pairings),
              () =>
                Outcomes.HasInsufficientContrast(highest, threshold, pairings)
            );
          })
        );

        const parent = target.parent(Node.flatTree).get() as Element;

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
