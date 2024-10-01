import { Keyword } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Longhand } from "../longhand.js";
import { isBlockContainer } from "../predicate/is-block-container.js";
import { isFlexContainer } from "../predicate/is-flex-container.js";
import { isGridContainer } from "../predicate/is-grid-container.js";

const { or } = Predicate;

const base = Longhand.fromKeywords(
  { inherits: false },
  "visible",
  "hidden",
  "clip",
  "scroll",
  "auto",
);

const isContainer = or(isBlockContainer, isFlexContainer, isGridContainer);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x}
 *
 * @internal
 */
export default Longhand.extend(base, {
  compute: (overflowX, style) =>
    overflowX.map((x) => {
      if (x.value !== "visible" && x.value !== "clip") {
        return x;
      }

      const y = style.specified("overflow-y").value;

      if (y.value === "visible" || y.value === "clip") {
        return x;
      }

      return x.value === "visible" ? Keyword.of("auto") : Keyword.of("hidden");
    }),
  use: (value, style) => Option.conditional(value, () => isContainer(style)),
});
