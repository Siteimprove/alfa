import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-style";

declare module "../property" {
  interface Longhands {
    "border-inline-start-style": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-style}
 * @internal
 */
export default Property.register(
  "border-inline-start-style",
  Property.extend(Base)
);
