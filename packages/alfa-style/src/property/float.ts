import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Value } from "../value";

import type { Computed as Position } from "./position";

const base = Longhand.fromKeywords(
  { inherits: false },
  "none",
  "left",
  "right"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/float}
 * @internal
 */
const property = Longhand.extend(base, {
  compute: (value, style) => {
    // We need the type assertion to help TS break a circular type reference:
    // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
    const position = style.computed("position").value as Position;

    return position.equals(Keyword.of("absolute")) ||
      position.equals(Keyword.of("fixed"))
      ? Value.of(Keyword.of("none"))
      : value;
  },
});

export default property;

export type Property = typeof property;
