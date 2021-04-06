import { Property } from "../property";

import Base, { Specified, Computed } from "./top";

declare module "../property" {
  interface Longhands {
    "inset-block-start": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block-start}
 * @internal
 */
export default Property.register("inset-block-start", Property.extend(Base));
