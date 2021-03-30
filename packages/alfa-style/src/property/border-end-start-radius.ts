import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-left-radius";

declare module "../property" {
  interface Longhands {
    "border-end-start-radius": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-end-start-radius}
 * @internal
 */
export default Property.register(
  "border-end-start-radius",
  Property.extend(Base)
);
