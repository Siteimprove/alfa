import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-color";

declare module "../property" {
  interface Longhands {
    "border-block-start-color": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-color}
 * @internal
 */
export default Property.register(
  "border-block-start-color",
  Property.extend(Base)
);
