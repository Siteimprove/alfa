import { Property } from "../property";

import Base, { Specified, Computed } from "./margin-top";

declare module "../property" {
  interface Longhands {
    "margin-right": Property<Specified, Computed>;
  }
}
/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right}
 * @internal
 */
export default Property.register("margin-right", Property.extend(Base));
