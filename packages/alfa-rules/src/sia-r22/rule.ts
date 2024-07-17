import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video.js";

import { expectation } from "../common/act/expectation.js";
import { Question } from "../common/act/question.js";

import { Scope, Stability } from "../tags/index.js";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r22",
  requirements: [Technique.of("G87"), Technique.of("G93"), Technique.of("H95")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        return {
          1: Question.of("has-captions", target).map((hasCaptions) =>
            expectation(
              hasCaptions,
              () => Outcomes.HasCaptions,
              () => Outcomes.HasNoCaptions,
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
  export const HasCaptions = Ok.of(
    Diagnostic.of(`The \`<video>\` element has captions`),
  );

  export const HasNoCaptions = Err.of(
    Diagnostic.of(`The \`<video>\` element does not have captions`),
  );
}
