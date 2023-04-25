import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./top";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/left}
 * @internal
 */
export default Property.register("left", Property.extend(Base));
