import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-color";

declare module "../property" {
  interface Longhands {
    "border-bottom-color": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-color}
 * @internal
 */
export default Property.register("border-bottom-color", Property.extend(Base));
