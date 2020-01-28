import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Some } from "@siteimprove/alfa-option";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
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
                ? Outcomes.HasPerceivableAlternative
                : Outcomes.HasNonPerceivableAlternative
              : Outcomes.HasNoAlternative
          ),
          2: label.map(label =>
            label.isSome()
              ? label.filter(isPerceivable(device)).isSome()
                ? Outcomes.HasPerceivableLabel
                : Outcomes.HasNonPerceivableLabel
              : Outcomes.HasNoLabel
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasPerceivableAlternative = Some.of(
    Ok.of(
      "The <video> element has a text alternative that is perceivable"
    ) as Result<string, string>
  );

  export const HasNonPerceivableAlternative = Some.of(
    Err.of(
      "The <video> element has a text alternative that is not perceivable"
    ) as Result<string, string>
  );

  export const HasNoAlternative = Some.of(
    Err.of("The <video> element has no text alternative") as Result<
      string,
      string
    >
  );

  export const HasPerceivableLabel = Some.of(
    Ok.of(
      "The <video> element is labelled as a video alternative and the label is perceivable"
    ) as Result<string, string>
  );

  export const HasNonPerceivableLabel = Some.of(
    Err.of(
      "The <video> element is labelled as a video alternative, but the label is not perceivable"
    ) as Result<string, string>
  );

  export const HasNoLabel = Some.of(
    Err.of(
      "The <video> element is not labelled as a video alternative"
    ) as Result<string, string>
  );
}
