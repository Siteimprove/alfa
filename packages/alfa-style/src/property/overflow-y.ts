import { Keyword } from "@siteimprove/alfa-css";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Longhand } from "../longhand.js";

import { isBlockContainer } from "../predicate/is-block-container.js";
import { isFlexContainer } from "../predicate/is-flex-container.js";
import { isGridContainer } from "../predicate/is-grid-container.js";

import Base from "./overflow-x.js";

const { or } = Predicate;
const isContainer = or(isBlockContainer, isFlexContainer, isGridContainer);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y}
 * @internal
 */
export default Longhand.extend(Base, {
  compute: (overflowY, style) =>
    overflowY.map((y) => {
      if (y.value !== "visible" && y.value !== "clip") {
        return y;
      }

      const x = style.specified("overflow-x").value;

      if (x.value === "visible" || x.value === "clip") {
        return y;
      }

      return y.value === "visible" ? Keyword.of("auto") : Keyword.of("hidden");
    }),
  use: (value, style) => (isContainer(style) ? Option.of(value) : None),
});
