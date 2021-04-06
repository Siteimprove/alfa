import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-left-radius";

declare module "../property" {
  interface Longhands {
    "border-bottom-left-radius": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius}
 * @internal
 */
export default Property.register(
  "border-bottom-left-radius",
  Property.extend(Base)
);
