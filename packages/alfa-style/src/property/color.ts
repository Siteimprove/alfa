import { Color } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

type Specified = Color;

type Computed = Color.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Color.system("canvastext"),
  Color.parse,
  (value) => value.map((color) => color.resolve()),
  {
    inherits: true,
  },
);
