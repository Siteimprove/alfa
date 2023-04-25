import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./border-top-color";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-color}
 * @internal
 */
export default Property.register(
  "border-block-start-color",
  Property.extend(Base)
);
