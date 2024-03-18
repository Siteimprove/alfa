import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { targetsOfPointerEvents } from "../common/applicability/targets-of-pointer-events";

import { WithName } from "../common/diagnostic";

import { isUserAgentControlled } from "../common/predicate/is-user-agent-controlled";
import { hasSufficientSize } from "../common/predicate/has-sufficient-size";

import { BoundingBox } from "../common/outcome/bounding-box";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r113",
  requirements: [Criterion.of("2.5.8")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return targetsOfPointerEvents(document, device);
      },

      expectations(target) {
        // Existence of a bounding box is guaranteed by applicability
        const box = target.getBoundingBox(device).getUnsafe();
        const name = WithName.getName(target, device).getOr("");
        return {
          1: expectation(
            isUserAgentControlled()(target),
            () => BoundingBox.IsUserAgentControlled(name, box),
            hasSufficientSize(24, device)(target)
              ? () => BoundingBox.HasSufficientSize(name, box)
              : () => BoundingBox.HasInsufficientSize(name, box),
          ),
        };
      },
    };
  },
});
