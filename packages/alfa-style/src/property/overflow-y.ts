import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

import Base from "./overflow-x";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/oevrflow-y}
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
});
