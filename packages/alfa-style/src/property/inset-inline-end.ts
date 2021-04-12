import { Property } from "../property";

import Base, { Specified, Computed } from "./top";

declare module "../property" {
  interface Longhands {
    "inset-inline-end": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-end}
 * @internal
 */
export default Property.register("inset-inline-end", Property.extend(Base));
