import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-left-radius";

declare module "../property" {
  interface Longhands {
    "border-bottom-right-radius": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius}
 * @internal
 */
export default Property.register(
  "border-bottom-right-radius",
  Property.extend(Base)
);
