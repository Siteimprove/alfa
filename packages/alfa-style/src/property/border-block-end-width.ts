import { Longhand } from "../longhand";
import { Value } from "../value";
import { Computed as StyleProp } from "./border-top-style";

import Base, { compute } from "./border-top-width";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-width}
 * @internal
 */
export default Longhand.extend(Base, {
  compute: (borderWidth, style) => {
    const borderStyle = style.computed(
      "border-block-end-style"
    ) as Value<StyleProp>;
    return compute(borderStyle, borderWidth, style);
  },
});
