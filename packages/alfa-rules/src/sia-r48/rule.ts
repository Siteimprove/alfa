import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasChild } from "../common/predicate/has-child";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";

import { Question } from "../common/question";
import { Ok, Err } from "@siteimprove/alfa-result";

const { filter, map } = Iterable;
const { and, or, nor, equals } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "ttps://siteimprove.github.io/sanshikan/rules/sia-r48.html",
  evaluate({ document }) {
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
            "is-below-audio-duration-threshold",
            "boolean",
            target,
            `Does the <${target.name}> element have a total audio duration of less than 3 seconds?`
          ).map(isBelowAudioDurationThreshold =>
            isBelowAudioDurationThreshold
              ? Ok.of(
                  `The total duration of audio output of the <${target.name}> element does not exceed 3 seconds`
                )
              : Err.of(
                  `The total duration of audio output of the <${target.name}> element exceeds 3 seconds`
                )
          )
        };
      }
    };
  }
});
