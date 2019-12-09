import { clamp } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Token } from "../syntax/token";

const { map, either } = Parser;

export type Opacity = number;

/**
 * @see https://drafts.csswg.org/css-color/#propdef-opacity
 */
const Opacity: Property<Opacity> = Property.of(
  1,
  map(
    either(Token.parseNumber(), Token.parsePercentage()),
    token => token.value
  ),
  style =>
    style
      .specified("opacity")
      .map(opacity => opacity.map(value => clamp(value, 0, 1))),
  {
    inherits: true
  }
);

export default Opacity;
