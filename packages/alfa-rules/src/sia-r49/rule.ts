import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { hasAttribute } from "../common/predicate/has-attribute";
import { hasChild } from "../common/predicate/has-child";
import { isPerceivable } from "../common/predicate/is-perceivable";

import { Question } from "../common/question";

const { isElement, hasName, hasNamespace } = Element;
const { or, nor } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r49.html",
  requirements: [Technique.of("G170")],
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
            "audio-control-mechanism",
            "node",
            target,
            `Where is the mechanism that can pause or stop the audio of the
            \`<${target.name}>\` element?`
          ).map((mechanism) =>
            expectation(
              mechanism.isSome(),
              () =>
                expectation(
                  and(
                    isElement,
                    and(
                      isPerceivable(device),
                      hasNonEmptyAccessibleName(device)
                    )
                  )(mechanism.get()),
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
