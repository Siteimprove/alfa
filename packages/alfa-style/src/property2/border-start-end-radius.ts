import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-left-radius";

declare module "../property" {
  interface Longhands {
    "border-start-end-radius": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-end-radius}
 * @internal
 */
export default Property.register(
  "border-start-end-radius",
  Property.extend(Base)
);
