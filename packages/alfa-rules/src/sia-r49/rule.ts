import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
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

const { hasNonEmptyAccessibleName, isPerceivableForAll } = DOM;
const { hasAttribute, hasName, hasNamespace, isElement } = Element;
const { or, nor, equals } = Predicate;
const { and } = Refinement;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r49",
  requirements: [Technique.of("G170")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ document, device }) {
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
            "audio-control-mechanism",
            target,
            `Where is the mechanism that can pause or stop the audio of the \`<${target.name}>\` element?`,
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
                          isPerceivableForAll(device),

                          // The mechanism is either the applicable <video> or
                          // <audio> element itself, in which case we assume the
                          // native controls provide accessible names, or it has
                          // a non-empty accessible name.
                          or(equals(target), hasNonEmptyAccessibleName(device)),
                        ),
                      ),
                    ),
                    () => Outcomes.HasPerceivablePauseMechanism(target.name),
                    () => Outcomes.HasNonPerceivablePauseMechanism(target.name),
                  ),
                () => Outcomes.HasNoPauseMechanism(target.name),
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
  export const HasPerceivablePauseMechanism = (name: string) =>
    Ok.of(
      Diagnostic.of(
        `The \`<${name}>\` element has a mechanism to pause or stop audio and
        the mechanism is perceivable`,
      ),
    );

  export const HasNonPerceivablePauseMechanism = (name: string) =>
    Err.of(
      Diagnostic.of(
        `The \`<${name}>\` element has a mechanism to pause or stop audio but
        the mechanism is not perceivable`,
      ),
    );

  export const HasNoPauseMechanism = (name: string) =>
    Err.of(
      Diagnostic.of(
        `The \`<${name}>\` element does not have a mechanism to pause or stop
        audio`,
      ),
    );
}
