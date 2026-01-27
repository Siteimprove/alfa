import type { Keyword } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Longhand } from "../longhand.js";
import { isFlexContainer } from "../predicate/index.js";

type Specified = Keyword<"nowrap"> | Keyword<"wrap"> | Keyword<"wrap-reverse">;

type Computed = Specified;

type Used = Option<Computed>;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap}
 * @internal
 */
export default Longhand.fromKeywords<"nowrap" | "wrap" | "wrap-reverse", Used>(
  {
    inherits: false,
    use: (value, style) =>
      value.map((wrap) =>
        Option.conditional(wrap, () => isFlexContainer(style)),
      ),
  },
  "nowrap",
  "wrap",
  "wrap-reverse",
);
