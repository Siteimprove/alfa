import { Keyword } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Longhand } from "../longhand.js";
import { isBlockContainerWithInlineFormattingContext } from "../predicate/index.js";

type Specified =
  | Keyword<"auto">
  | Keyword<"balance">
  | Keyword<"stable">
  | Keyword<"pretty">
  | Keyword<"avoid-orphans">;

type Computed = Specified;

type Used = Option<Computed>;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style}
 * @internal
 */
export default Longhand.fromKeywords<
  "auto" | "balance" | "stable" | "pretty" | "avoid-orphans",
  Used
>(
  {
    inherits: true,
    use: (value, style) =>
      value.map((wrap) =>
        Option.conditional(wrap, () =>
          isBlockContainerWithInlineFormattingContext(style),
        ),
      ),
  },
  "auto",
  "balance",
  "stable",
  "pretty",
  "avoid-orphans",
);
