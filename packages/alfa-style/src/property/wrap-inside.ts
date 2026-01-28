import { Keyword } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Longhand } from "../longhand.js";
import { isInlineBox } from "../predicate/index.js";

type Specified = Keyword<"auto"> | Keyword<"avoid">;

type Computed = Specified;

type Used = Option<Computed>;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/wrap-inside}
 * @internal
 */
export default Longhand.fromKeywords<"auto" | "avoid", Used>(
  {
    inherits: false,
    use: (value, style) =>
      value.map((wrap) => Option.conditional(wrap, () => isInlineBox(style))),
  },
  "auto",
  "avoid",
);
