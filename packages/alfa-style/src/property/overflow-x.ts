import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

const base = Longhand.fromKeywords(
  { inherits: false },
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
});
