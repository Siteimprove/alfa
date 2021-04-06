import { Property } from "../property";

import Base, { Specified, Computed } from "./top";

declare module "../property" {
  interface Longhands {
    "inset-inline-start": Property<Specified, Computed>;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-start}
 * @internal
 */
export default Property.register("inset-inline-start", Property.extend(Base));
