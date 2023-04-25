import { Longhand } from "../foo-prop-class";

import Base from "./border-top-left-radius";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-end-radius}
 * @internal
 */
export default Property.register(
  "border-start-end-radius",
  Property.extend(Base)
);
