import { Option } from "@siteimprove/alfa-option";
import { Longhand } from "../longhand.js";
import { isFlexContainer } from "../predicate/is-flex-container.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap}
 * @internal
 */
export default Longhand.fromKeywords(
  {
    inherits: false,
    use: (value, style) =>
      Option.conditional(value, () => isFlexContainer(style)),
  },
  "nowrap",
  "wrap",
  "wrap-reverse",
);
