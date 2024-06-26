import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { Question } from "../common/act/question.js";

import { Scope, Stability } from "../tags/index.js";

const { hasAttribute, hasName, hasNamespace, isElement } = Element;
const { or, nor } = Predicate;
const { and } = Refinement;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r48",
  requirements: [Technique.of("G60")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.composedNested)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("audio", "video"),
              hasAttribute("autoplay"),
              nor(hasAttribute("paused"), hasAttribute("muted")),
              or(
                hasAttribute("src"),
                Node.hasChild(and(isElement, hasName("source"))),
              ),
            ),
          )
          .map((element) => {
            const isAboveDurationThreshold = Question.of(
              "is-above-duration-threshold",
              element,
              `Does the \`<${element.name}>\` element have a duration of more than 3 seconds?`,
            ).map((isAboveDurationThreshold) =>
              isAboveDurationThreshold ? Option.of(element) : None,
            );

            if (element.name === "audio") {
              return isAboveDurationThreshold;
            } else {
              return Question.of(
                "has-audio",
                element,
                `Does the \`<${element.name}>\` element contain audio?`,
              ).map((hasAudio) => (hasAudio ? isAboveDurationThreshold : None));
            }
          });
      },

      expectations(target) {
        return {
          1: Question.of(
            "is-below-audio-duration-threshold",
            target,
            `Does the \`<${target.name}>\` element have a total audio duration of less than 3 seconds?`,
          ).map((isBelowAudioDurationThreshold) =>
            expectation(
              isBelowAudioDurationThreshold,
              () => Outcomes.DurationBelowThreshold(target.name),
              () => Outcomes.DurationAboveThreshold(target.name),
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
  export const DurationBelowThreshold = (name: string) =>
    Ok.of(
      Diagnostic.of(
        `The total duration of audio output of the \`<${name}>\` element does
        not exceed 3 seconds`,
      ),
    );

  export const DurationAboveThreshold = (name: string) =>
    Err.of(
      Diagnostic.of(
        `The total duration of audio output of the \`<${name}>\` element exceeds
        3 seconds`,
      ),
    );
}
