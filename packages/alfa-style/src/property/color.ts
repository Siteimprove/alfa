import { Color, CSS4Color, System } from "@siteimprove/alfa-css";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = Color;

type Computed = Color.Canonical;

type Used = CSS4Color.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color}
 * @internal
 */
export default Longhand.of<Specified, Computed, Used>(
  Color.system("canvastext"),
  Color.parse,
  (value) => value.map(Color.partiallyResolve),
  {
    inherits: true,
    use: (
      value,
      style, // TODO: use Color.resolve
    ) =>
      value.map((computed) =>
        Selective.of(computed)
          .if(Color.isCSS4Color, (color) => color)
          .if(Color.isSystem, System.resolve)
          .else(() => Resolver.color(style.parent).currentColor)
          .get(),
      ),
  },
);
