import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./border-top-left-radius";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius}
 * @internal
 */
export default Property.register(
  "border-bottom-left-radius",
  Property.extend(Base)
);
