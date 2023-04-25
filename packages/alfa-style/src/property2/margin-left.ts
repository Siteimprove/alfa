import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./margin-top";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left}
 * @internal
 */
export default Property.register("margin-left", Property.extend(Base));
