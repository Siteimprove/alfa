import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

/**
 * @internal
 */
export type Specified =
  | Keyword<"visible">
  | Keyword<"hidden">
  | Keyword<"clip">
  | Keyword<"scroll">
  | Keyword<"auto">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "visible",
  "hidden",
  "clip",
  "scroll",
  "auto"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("visible"),
  parse,
  (overflowX, style) =>
    overflowX.map((x) => {
      if (x.value !== "visible" && x.value !== "clip") {
        return x;
      }

      const y = style.specified("overflow-y").value;

      if (y.value === "visible" || y.value === "clip") {
        return x;
      }

      return x.value === "visible" ? Keyword.of("auto") : Keyword.of("hidden");
    })
);
