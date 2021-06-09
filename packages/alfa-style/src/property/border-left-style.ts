import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-style";

declare module "../property" {
  interface Longhands {
    "border-left-style": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-style}
 * @internal
 */
export default Property.register("border-left-style", Property.extend(Base));
