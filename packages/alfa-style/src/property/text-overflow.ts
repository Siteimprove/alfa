import { Keyword } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";

import { Longhand } from "../longhand.js";
import { isBlockContainer } from "../predicate/index.js";

type Specified = Keyword<"clip"> | Keyword<"ellipsis">;

type Computed = Specified;

type Used = Option<Computed>;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow}
 * @internal
 */
export default Longhand.fromKeywords<"clip" | "ellipsis", Used>(
  {
    inherits: false,
    use: (value, style) =>
      value.map((overflow) =>
        Option.conditional(overflow, () => isBlockContainer(style)),
      ),
  },
  "clip",
  "ellipsis",
);
