import { Length } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = Length;

type Computed = Length.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset}
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  Length.parse,
  (value, style) => value.resolve(Resolver.length(style)),
);
