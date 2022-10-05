import { Rule } from "@siteimprove/alfa-act";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Question } from "../common/act/question";
import { nonDisabledTexts } from "../common/applicability/non-disabled-texts";

import { getBackground, getForeground } from "../common/dom/get-colors";

import { isLargeText } from "../common/predicate";

import { Contrast as Diagnostic } from "../common/diagnostic/contrast";
import { contrast } from "../common/expectation/contrast";
import { Contrast as Outcomes } from "../common/outcome/contrast";

import { Scope } from "../tags";

const { flatMap, map } = Iterable;
const { max } = Math;

export default Rule.Atomic.of<Page, Text, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r69",
  requirements: [Criterion.of("1.4.3"), Criterion.of("1.4.6")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return nonDisabledTexts(document, device);
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
