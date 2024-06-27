import { Longhand } from "../longhand.js";
import type { Value } from "../value.js";

import type Style from "./border-top-style.js";
import Base, { compute } from "./border-top-width.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-width}
 * @internal
 */
export default Longhand.extend(Base, {
  compute: (borderWidth, style) => {
    const borderStyle = style.computed("border-inline-end-style") as Value<
      Longhand.Computed<typeof Style>
    >;
    return compute(borderStyle, borderWidth, style);
  },
});
