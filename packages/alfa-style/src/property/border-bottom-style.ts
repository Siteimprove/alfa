import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-style";

declare module "../property" {
  interface Longhands {
    "border-bottom-style": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-style}
 * @internal
 */
export default Property.register("border-bottom-style", Property.extend(Base));
