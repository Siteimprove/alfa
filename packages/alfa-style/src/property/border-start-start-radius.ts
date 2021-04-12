import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-left-radius";

declare module "../property" {
  interface Longhands {
    "border-start-start-radius": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-start-radius}
 * @internal
 */
export default Property.register(
  "border-start-start-radius",
  Property.extend(Base)
);
