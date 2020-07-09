import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

export type Whitespace = Keyword<
  "normal" | "pre" | "nowrap" | "pre-wrap" | "break-spaces" | "pre-line"
>;

/**
 * @see https://drafts.csswg.org/css-text/#propdef-white-space
 */
export const Whitespace: Property<Whitespace> = Property.of(
  Keyword.of("normal"),
  Keyword.parse(
    "normal",
    "pre",
    "nowrap",
    "pre-wrap",
    "break-spaces",
    "pre-line"
  ),
  (style) => style.substituted("white-space"),
  {
    inherits: true,
  }
);
