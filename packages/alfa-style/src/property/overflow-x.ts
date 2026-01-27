import { Keyword } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Longhand } from "../longhand.js";
import {
  isBlockContainer,
  isFlexContainer,
  isGridContainer,
} from "../predicate/index.js";

const { or } = Predicate;

type Specified =
  | Keyword<"visible">
  | Keyword<"hidden">
  | Keyword<"clip">
  | Keyword<"scroll">
  | Keyword<"auto">;

type Computed = Specified;

type Used = Option<Computed>;

const base = Longhand.fromKeywords<
  "visible" | "hidden" | "clip" | "scroll" | "auto",
  Used
>(
  { inherits: false, use: (value) => value.map(Option.of) },
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
export default Longhand.extend<Specified, Computed, Used>(base, {
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
  use: (value, style) =>
    value.map((overflow) =>
      Option.conditional(overflow, () => isContainer(style)),
    ),
});
