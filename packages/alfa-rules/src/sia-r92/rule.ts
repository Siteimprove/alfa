import { Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { textWithInlinedImportantProperty } from "../common/applicability/text-with-inlined-important-property.js";
import { isWideEnough } from "../common/expectation/is-wide-enough.js";

import { Scope, Stability, Version } from "../tags/index.js";

const property = "word-spacing";
const threshold = 0.16;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r92",
  requirements: [Criterion.of("1.4.12")],
  tags: [Scope.Component, Stability.Stable, Version.of(2)],
  evaluate({ device, document }) {
    return {
      applicability() {
        return textWithInlinedImportantProperty(document, device, property);
      },

      expectations(target) {
        return isWideEnough(target, device, property, threshold);
      },
    };
  },
});
