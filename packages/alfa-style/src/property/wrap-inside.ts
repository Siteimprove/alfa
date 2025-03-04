import { Option } from "@siteimprove/alfa-option";
import { Longhand } from "../longhand.js";
import { isInlineBox } from "../predicate/index.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/wrap-inside}
 * @internal
 */
export default Longhand.fromKeywords(
  {
    inherits: false,
    use: (value, style) => Option.conditional(value, () => isInlineBox(style)),
  },
  "auto",
  "avoid",
);
