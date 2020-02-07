import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

export type Visibility = Keyword<"visible" | "hidden" | "collapse">;

/**
 * @see https://drafts.csswg.org/css2/visufx.html#propdef-visibility
 */
export const Visibility: Property<Visibility> = Property.of(
  Keyword.of("visible"),
  Keyword.parse("visible", "hidden", "collapse"),
  style => style.specified("visibility"),
  {
    inherits: true
  }
);
