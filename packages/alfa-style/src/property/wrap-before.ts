import { Keyword } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Longhand } from "../longhand.js";
import { isFlexItem, isInlineLevelBox } from "../predicate/index.js";

const { or, test } = Predicate;

type Specified =
  | Keyword<"auto">
  | Keyword<"avoid">
  | Keyword<"avoid-line">
  | Keyword<"avoid-flex">
  | Keyword<"line">
  | Keyword<"flex">;

type Computed = Specified;

type Used = Option<Computed>;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/wrap-before}
 * @internal
 */
export default Longhand.fromKeywords<
  "auto" | "avoid" | "avoid-line" | "avoid-flex" | "line" | "flex",
  Used
>(
  {
    inherits: false,
    use: (value, style) =>
      value.map((wrap) =>
        Option.conditional(wrap, () =>
          test(or(isInlineLevelBox, isFlexItem), style),
        ),
      ),
  },
  "auto",
  "avoid",
  "avoid-line",
  "avoid-flex",
  "line",
  "flex",
);
