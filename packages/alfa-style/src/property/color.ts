import { Color, CSS4Color, System } from "@siteimprove/alfa-css";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import type { Style } from "../style.js";
import type { Value } from "../value.js";

type Specified = Color;

type Computed = Color.Canonical;

type Used = CSS4Color.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color}
 * @internal
 */
export default Longhand.of<Specified, Computed, Used>(
  Color.partiallyResolve(Color.system("canvastext")),
  Color.parse,
  (value) => value.map(Color.partiallyResolve),
  {
    inherits: true,
    // We need to delay the call to `style.parent` to avoid infinite recursion
    // at the top of the tree with the empty style. Hence, we break down the
    // resolution instead of calling `Resolver.color`.
    use: (value: Value<Computed>, style: Style): Value<Used> =>
      value.map((computed) =>
        Selective.of(computed)
          .if(Color.isCSS4Color, (color) => color)
          .if(Color.isSystem, System.resolve)
          .else(() => style.parent.used("color").value)
          .get(),
      ),
  },
);
