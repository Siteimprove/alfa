import {
  Color as CSSColor,
  CSS4Color,
  Percentage,
} from "@siteimprove/alfa-css";
import { None, Option } from "@siteimprove/alfa-option";
import type { Style } from "@siteimprove/alfa-style";

/**
 * @public
 */
export namespace Color {
  export type Computed = CSSColor.Canonical;

  export type Resolved = CSS4Color.Canonical;
}
