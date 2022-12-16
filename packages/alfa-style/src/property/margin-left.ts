import { Property } from "../property";

import Base, { Specified, Computed } from "./margin-top";

declare module "../property" {
  interface Longhands {
    "margin-left": Property<Specified, Computed>;
  }
}
/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left}
 * @internal
 */
export default Property.register("margin-left", Property.extend(Base));
