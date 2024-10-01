import { Option } from "@siteimprove/alfa-option";

import { Longhand } from "../longhand.js";
import { isBlockContainer } from "../predicate/is-block-container.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow}
 * @internal
 */
export default Longhand.fromKeywords(
  {
    inherits: false,
    use: (value, style) =>
      Option.conditional(value, () => isBlockContainer(style)),
  },
  "clip",
  "ellipsis",
);
