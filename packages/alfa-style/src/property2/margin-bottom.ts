import { Property } from "../property";

import Base, { Specified, Computed } from "./margin-top";

declare module "../property" {
  interface Longhands {
    "margin-bottom": Property<Specified, Computed>;
  }
}
/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom}
 * @internal
 */
export default Property.register("margin-bottom", Property.extend(Base));
