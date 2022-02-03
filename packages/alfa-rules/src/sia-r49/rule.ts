import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Question } from "../common/act/question";

import {
  hasNonEmptyAccessibleName,
  hasAttribute,
  hasChild,
  isPerceivable,
} from "../common/predicate";

import { Scope } from "../tags";

const { isElement, hasName, hasNamespace } = Element;
const { or, nor, equals } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r49",
  requirements: [Technique.of("G170")],
  tags: [Scope.Component],
  evaluate({ document, device }) {
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
          .map((element) => {
            const isAboveDurationThreshold = Question.of(
              "is-above-duration-threshold",
              element,
              `Does the \`<${element.name}>\` element have a duration of more than 3 seconds?`
            ).map((isAboveDurationThreshold) =>
              isAboveDurationThreshold ? Option.of(element) : None
            );

            if (element.name === "audio") {
              return isAboveDurationThreshold;
            } else {
              return Question.of(
                "has-audio",
                element,
                `Does the \`<${element.name}>\` element contain audio?`
              ).map((hasAudio) => (hasAudio ? isAboveDurationThreshold : None));
            }
          });
      },

      expectations(target) {
        return {
          1: Question.of(
            "audio-control-mechanism",
            target,
            `Where is the mechanism that can pause or stop the audio of the \`<${target.name}>\` element?`
          )
            // If the applicable <video> or <audio> element uses native controls
            // we assume that the mechanism is the element itself.
            .answerIf(target.attribute("controls").isSome(), Option.of(target))
            .map((mechanism) =>
              expectation(
                mechanism.isSome(),
                () =>
                  expectation(
                    mechanism.some(
                      and(
                        isElement,
                        and(
                          isPerceivable(device),

                          // The mechanism is either the applicable <video> or
                          // <audio> element itself, in which case we assume the
                          // native controls provide accessible names, or it has
                          // a non-empty accessible name.
                          or(equals(target), hasNonEmptyAccessibleName(device))
                        )
                      )
                    ),
                    () => Outcomes.HasPerceivablePauseMechanism(target.name),
                    () => Outcomes.HasNonPerceivablePauseMechanism(target.name)
                  ),
                () => Outcomes.HasNoPauseMechanism(target.name)
              )
            ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasPerceivablePauseMechanism = (name: string) =>
    Ok.of(
      Diagnostic.of(
        `The \`<${name}>\` element has a mechanism to pause or stop audio and
        the mechanism is perceivable`
      )
    );

  export const HasNonPerceivablePauseMechanism = (name: string) =>
    Err.of(
      Diagnostic.of(
        `The \`<${name}>\` element has a mechanism to pause or stop audio but
        the mechanism is not perceivable`
      )
    );

  export const HasNoPauseMechanism = (name: string) =>
    Err.of(
      Diagnostic.of(
        `The \`<${name}>\` element does not have a mechanism to pause or stop
        audio`
      )
    );
}
