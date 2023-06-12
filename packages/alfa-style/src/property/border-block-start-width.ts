import { Longhand } from "../longhand";
import type { Value } from "../value";
import type { Property as StyleProp } from "./border-top-style";

import Base, { compute } from "./border-top-width";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-width}
 * @internal
 */
export default Longhand.extend(Base, {
  compute: (borderWidth, style) => {
    const borderStyle = style.computed("border-block-start-style") as Value<
      Longhand.Computed<StyleProp>
    >;
    return compute(borderStyle, borderWidth, style);
  },
});
