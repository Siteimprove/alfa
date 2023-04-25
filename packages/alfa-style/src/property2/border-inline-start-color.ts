import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-color";

declare module "../property" {
  interface Longhands {
    "border-inline-start-color": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-color}
 * @internal
 */
export default Property.register(
  "border-inline-start-color",
  Property.extend(Base)
);
