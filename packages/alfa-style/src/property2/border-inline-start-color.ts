import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./border-top-color";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-color}
 * @internal
 */
export default Property.register(
  "border-inline-start-color",
  Property.extend(Base)
);
