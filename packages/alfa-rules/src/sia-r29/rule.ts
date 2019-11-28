import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { audio } from "../common/applicability/audio";

import { isPerceivable } from "../common/predicate/is-perceivable";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r29.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return audio(document, device);
      },

      expectations(target) {
        const alt = Question.of(
          "text-alternative",
          "node",
          target,
          "Where is the text alternative of the <audio> element?"
        );

        const label = Question.of(
          "label",
          "node",
          target,
          "Where is the text that labels the <audio> element as an audio alternative?"
        );

        return {
          1: alt.map(alt =>
            alt.isSome()
              ? alt.filter(isPerceivable(device)).isSome()
                ? Ok.of(
                    "The <audio> element has a text alternative that is perceivable"
                  )
                : Err.of(
                    "The <audio> element has a text alternative that is not perceivable"
                  )
              : Err.of("The <audio> element has no text alternative")
          ),
          2: label.map(label =>
            label.isSome()
              ? label.filter(isPerceivable(device)).isSome()
                ? Ok.of(
                    "The <audio> element is labelled as an audio alternative and the label is perceivable"
                  )
                : Err.of(
                    "The <audio> element is labelled as an audio alternative, but the label is not perceivable"
                  )
              : Err.of(
                  "The <audio> element is not labelled as an audio alternative"
                )
          )
        };
      }
    };
  }
});
