import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasChild } from "../common/predicate/has-child";

import { Question } from "../common/question";

const { isElement, hasName, hasNamespace } = Element;
const { or, nor } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r48.html",
  requirements: [Technique.of("G60")],
  evaluate({ document }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("audio", "video"),
              hasAttribute("autoplay"),
              nor(hasAttribute("paused"), hasAttribute("muted")),
              or(
                hasAttribute("src"),
                hasChild(and(isElement, hasName("source")))
              )
            )
          )
          .map((element) =>
            Question.of(
              "has-audio",
              "boolean",
              element,
              `Does the \`<${element.name}>\` element contain audio?`
            ).map((hasAudio) =>
              hasAudio
                ? Question.of(
                    "is-above-duration-threshold",
                    "boolean",
                    element,
                    `Does the \`<${element.name}>\` element have a duration of
                    more than 3 seconds?`
                  ).map((isAboveDurationThreshold) =>
                    isAboveDurationThreshold ? Option.of(element) : None
                  )
                : None
            )
          );
      },

      expectations(target) {
        return {
          1: Question.of(
            "is-below-audio-duration-threshold",
            "boolean",
            target,
            `Does the \`<${target.name}>\` element have a total audio duration
            of less than 3 seconds?`
          ).map((isBelowAudioDurationThreshold) =>
            expectation(
              isBelowAudioDurationThreshold,
              () => Outcomes.DurationBelowThreshold(target.name),
              () => Outcomes.DurationAboveThreshold(target.name)
            )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const DurationBelowThreshold = (name: string) =>
    Ok.of(
      Diagnostic.of(
        `The total duration of audio output of the \`<${name}>\` element does
        not exceed 3 seconds`
      )
    );

  export const DurationAboveThreshold = (name: string) =>
    Err.of(
      Diagnostic.of(
        `The total duration of audio output of the \`<${name}>\` element exceeds
        3 seconds`
      )
    );
}
