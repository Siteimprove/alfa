import { Color, CSS4Color } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";

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
    use: (value, style) =>
      value.map(Color.resolve(Resolver.color(style.parent))),
  },
);
