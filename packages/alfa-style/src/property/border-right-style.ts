import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-style";

declare module "../property" {
  interface Longhands {
    "border-right-style": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-style}
 * @internal
 */
export default Property.register("border-right-style", Property.extend(Base));
