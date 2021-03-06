import { Length } from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

import Base, { Specified, Computed } from "./border-top-width";

declare module "../property" {
  interface Longhands {
    "border-left-width": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-width}
 * @internal
 */
export default Property.register(
  "border-left-width",
  Property.extend(Base, {
    compute: (borderWidth, style) =>
      borderWidth.map((value) => {
        if (
          style
            .computed("border-left-style")
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
  })
);
