import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-style";

declare module "../property" {
  interface Longhands {
    "border-inline-end-style": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-style}
 * @internal
 */
export default Property.register(
  "border-inline-end-style",
  Property.extend(Base)
);
