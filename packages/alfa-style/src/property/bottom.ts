import { Property } from "../property";

import Base, { Specified, Computed } from "./top";

declare module "../property" {
  interface Longhands {
    bottom: Property<Specified, Computed>;
  }
}
/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/bottom}
 * @internal
 */
export default Property.register("bottom", Property.extend(Base));
