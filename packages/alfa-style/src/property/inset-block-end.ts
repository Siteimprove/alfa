import { Property } from "../property";

import Base, { Specified, Computed } from "./top";

declare module "../property" {
  interface Longhands {
    "inset-block-end": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block-end}
 * @internal
 */
export default Property.register("inset-block-end", Property.extend(Base));
