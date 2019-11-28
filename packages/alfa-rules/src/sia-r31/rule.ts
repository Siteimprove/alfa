import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { isPerceivable } from "../common/predicate/is-perceivable";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r31.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        const alt = Question.of(
          "text-alternative",
          "node",
          target,
          "Where is the text alternative of the <video> element?"
        );

        const label = Question.of(
          "label",
          "node",
          target,
          "Where is the text that labels the <video> element as a video alternative?"
        );

        return {
          1: alt.map(alt =>
            alt.isSome()
              ? alt.filter(isPerceivable(device)).isSome()
                ? Ok.of(
                    "The <video> element has a text alternative that is perceivable"
                  )
                : Err.of(
                    "The <video> element has a text alternative that is not perceivable"
                  )
              : Err.of("The <video> element has no text alternative")
          ),
          2: label.map(label =>
            label.isSome()
              ? label.filter(isPerceivable(device)).isSome()
                ? Ok.of(
                    "The <video> element is labelled as a video alternative and the label is perceivable"
                  )
                : Err.of(
                    "The <video> element is labelled as a video alternative, but the label is not perceivable"
                  )
              : Err.of(
                  "The <video> element is not labelled as a video alternative"
                )
          )
        };
      }
    };
  }
});
