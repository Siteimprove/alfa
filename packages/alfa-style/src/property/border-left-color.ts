import { Property } from "../property";

import Base, { Specified, Computed } from "./border-top-color";

declare module "../property" {
  interface Longhands {
    "border-left-color": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-color}
 * @internal
 */
export default Property.register("border-left-color", Property.extend(Base));
