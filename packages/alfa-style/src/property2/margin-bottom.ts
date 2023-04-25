import { Longhand } from "../foo-prop-class";

import Base, { Specified, Computed } from "./margin-top";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom}
 * @internal
 */
export default Property.register("margin-bottom", Property.extend(Base));
