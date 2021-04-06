import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-color";

declare module "../property" {
  interface Longhands {
    "border-right-color": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-color}
 * @internal
 */
export default Property.register("border-right-color", Property.extend(Base));
