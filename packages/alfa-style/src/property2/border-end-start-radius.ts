import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./border-top-left-radius";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-end-start-radius}
 * @internal
 */
export default Property.register(
  "border-end-start-radius",
  Property.extend(Base)
);
