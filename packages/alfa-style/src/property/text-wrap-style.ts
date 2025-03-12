import { Option } from "@siteimprove/alfa-option";
import { Longhand } from "../longhand.js";
import { isBlockContainerWithInlineFormattingContext } from "../predicate/index.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style}
 * @internal
 */
export default Longhand.fromKeywords(
  {
    inherits: true,
    use: (value, style) =>
      Option.conditional(value, () =>
        isBlockContainerWithInlineFormattingContext(style),
      ),
  },
  "auto",
  "balance",
  "stable",
  "pretty",
  "avoid-orphans",
);
