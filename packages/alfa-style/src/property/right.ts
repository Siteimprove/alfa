import { Property } from "../property";

import Base, { Specified, Computed } from "./top";

declare module "../property" {
  interface Longhands {
    right: Property<Specified, Computed>;
  }
}
/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/right}
 * @internal
 */
export default Property.register("right", Property.extend(Base));
