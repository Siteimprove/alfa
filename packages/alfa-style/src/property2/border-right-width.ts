import { Length } from "@siteimprove/alfa-css";

import { Longhand } from "../foo-prop-class";
import { Resolver } from "../resolver";

import Base from "./border-top-width";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-width}
 * @internal
 */
export default Longhand.extend(Base, {
  compute: (borderWidth, style) =>
    borderWidth.map((value) => {
      if (
        style
          .computed("border-right-style")
          .some(({ value }) => value === "none" || value === "hidden")
      ) {
        return Length.of(0, "px");
      }

      switch (value.type) {
        case "keyword":
          switch (value.value) {
            case "thin":
              return Length.of(1, "px");

            case "medium":
              return Length.of(3, "px");

            case "thick":
              return Length.of(5, "px");
          }

        case "length":
          return Resolver.length(value, style);
      }
    }),
});
