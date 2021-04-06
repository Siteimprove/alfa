import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-color";

declare module "../property" {
  interface Longhands {
    "border-block-end-color": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-color}
 * @internal
 */
export default Property.register(
  "border-block-end-color",
  Property.extend(Base)
);
