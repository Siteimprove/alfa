import { Rule } from "@siteimprove/alfa-act";
import type { Element, Text } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import type { Group } from "../common/act/group.ts";
import type { Question } from "../common/act/question.ts";
import { nonDisabledTexts } from "../common/applicability/non-disabled-texts.ts";

import { hasSufficientContrast } from "../common/expectation/contrast.ts";

import { Scope, Stability, Version } from "../tags/index.ts";

export default Rule.Atomic.of<
  Page,
  Text,
  Question.Metadata,
  Text | Group<Element>
>({
  uri: "https://alfa.siteimprove.com/rules/sia-r66",
  requirements: [Criterion.of("1.4.6")],
  tags: [Scope.Component, Stability.Stable, Version.of(2)],
  evaluate({ device, document }) {
    return {
      applicability() {
        return nonDisabledTexts(document, device);
      },

      expectations(target) {
        return hasSufficientContrast(target, device, 4.5, 7);
      },
    };
  },
});
