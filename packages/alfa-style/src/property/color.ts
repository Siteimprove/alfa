import { Current, Percentage, RGB, System } from "@siteimprove/alfa-css";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

export type Color = Color.Specified | Color.Computed;

export namespace Color {
  export type Specified = css.Color;

  export type Computed = RGB<Percentage, Percentage> | Current | System;
}

/**
 * @see https://drafts.csswg.org/css-color/#propdef-color
 */
export const Color: Property<Color.Specified, Color.Computed> = Property.of(
  css.Color.system("canvastext"),
  css.Color.parse,
  (style) => style.specified("color").map((color) => Resolver.color(color)),
  {
    inherits: true,
  }
);
