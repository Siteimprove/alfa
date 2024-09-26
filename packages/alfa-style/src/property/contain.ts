import { Keyword, Contain } from "@siteimprove/alfa-css";
import { Longhand } from "../longhand.js";

type Specified = Contain;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/contain}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  Contain.parse,
  (value) => value,
  { inherits: false },
);
