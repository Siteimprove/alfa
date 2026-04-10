import { Longhand } from "../longhand.ts";
import type { Value } from "../value.ts";

import type Style from "./border-top-style.ts";
import Base, { compute } from "./border-top-width.ts";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-width}
 * @internal
 */
export default Longhand.extend(Base, {
  compute: (borderWidth, style) => {
    const borderStyle = style.computed("border-inline-start-style") as Value<
      Longhand.Computed<typeof Style>
    >;
    return compute(borderStyle, borderWidth, style);
  },
});
