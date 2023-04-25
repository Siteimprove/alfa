import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./border-top-left-radius";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-right-radius}
 * @internal
 */
export default Property.register(
  "border-top-right-radius",
  Property.extend(Base)
);
