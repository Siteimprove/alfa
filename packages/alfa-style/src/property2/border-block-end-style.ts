import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./border-top-style";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-style}
 * @internal
 */
export default Property.register(
  "border-block-end-style",
  Property.extend(Base)
);
