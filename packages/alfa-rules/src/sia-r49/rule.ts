import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasAttribute } from "../common/predicate/has-attribute";
import { hasChild } from "../common/predicate/has-child";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { isPerceivable } from "../common/predicate/is-perceivable";

import { Question } from "../common/question";
import { Ok, Err } from "@siteimprove/alfa-result";

const { filter, map, isEmpty } = Iterable;
const { and, or, nor, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "ttps://siteimprove.github.io/sanshikan/rules/sia-r49.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return map(
          filter(
            document.descendants({ composed: true, nested: true }),
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML)),
                and(
                  hasName(equals("audio", "video")),
                  and(
                    hasAttribute("autoplay"),
                    and(
                      nor(hasAttribute("paused"), hasAttribute("muted")),
                      or(
                        hasAttribute("src"),
                        hasChild(
                          and(Element.isElement, hasName(equals("source")))
                        )
                      )
                    )
                  )
                )
              )
            )
          ),
          element =>
            Question.of(
              "has-audio",
              "boolean",
              element,
              `Does the <${element.name}> element contain audio?`
            ).map(hasAudio =>
              hasAudio
                ? Question.of(
                    "is-above-duration-threshold",
                    "boolean",
                    element,
                    `Does the <${element.name}> element have a duration of more than 3 seconds?`
                  ).map(isAboveDurationThreshold =>
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
          ).map(mechanism =>
            mechanism.isSome()
              ? test(
                  and(
                    Element.isElement,
                    and(
                      isPerceivable(device),
                      hasAccessibleName(device, not(isEmpty))
                    )
                  ),
                  mechanism.get()
                )
                ? Ok.of(
                    `The <${target.name}> element has a mechanism to pause or stop audio and the mechanism is perceivable`
                  )
                : Err.of(
                    `The <${target.name}> element has a mechanism to pause or stop audio but the mechanism is not perceivable`
                  )
              : Err.of(
                  `The <${target.name}> element does not have a mechanism to pause or stop audio`
                )
          )
        };
      }
    };
  }
});
