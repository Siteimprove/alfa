import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Longhand } from "../longhand.js";
import { isFlexItem, isInlineLevelBox } from "../predicate/index.js";

const { or, test } = Predicate;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/wrap-before}
 * @internal
 */
export default Longhand.fromKeywords(
  {
    inherits: false,
    use: (value, style) =>
      Option.conditional(value, () =>
        test(or(isInlineLevelBox, isFlexItem), style),
      ),
  },
  "auto",
  "avoid",
  "avoid-line",
  "avoid-flex",
  "line",
  "flex",
);
