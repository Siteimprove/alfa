import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasAttribute } from "../common/predicate/has-attribute";
import { hasChild } from "../common/predicate/has-child";
import { isPerceivable } from "../common/predicate/is-perceivable";

import { Question } from "../common/question";

const { isElement, isHtmlElementWithName, hasName } = Element;
const { isEmpty } = Iterable;
const { and, or, nor, not } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r49.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(
            and(
              isHtmlElementWithName("audio", "video"),
              and(
                hasAttribute("autoplay"),
                nor(hasAttribute("paused"), hasAttribute("muted")),
                or(
                  hasAttribute("src"),
                  hasChild(and(isElement, hasName("source")))
                )
              )
            )
          )
          .map((element) =>
            Question.of(
              "has-audio",
              "boolean",
              element,
              `Does the <${element.name}> element contain audio?`
            ).map((hasAudio) =>
              hasAudio
                ? Question.of(
                    "is-above-duration-threshold",
                    "boolean",
                    element,
                    `Does the <${element.name}> element have a duration of more than 3 seconds?`
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
            `Where is the mechanism that can pause or stop the audio of the <${target.name}> element?`
          ).map((mechanism) =>
            expectation(
              mechanism.isSome(),
              () =>
                expectation(
                  and(
                    Element.isElement,
                    and(
                      isPerceivable(device),
                      hasAccessibleName(device, not(isEmpty))
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
  export const HasPerceivablePauseMechanism = (
    name: string
  ): Result<string, string> =>
    Ok.of(
      `The <${name}> element has a mechanism to pause or stop audio and the mechanism is perceivable`
    );

  export const HasNonPerceivablePauseMechanism = (
    name: string
  ): Result<string, string> =>
    Err.of(
      `The <${name}> element has a mechanism to pause or stop audio but the mechanism is not perceivable`
    );

  export const HasNoPauseMechanism = (name: string): Result<string, string> =>
    Err.of(
      `The <${name}> element does not have a mechanism to pause or stop audio`
    );
}
