import { Color } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Context } from "@siteimprove/alfa-selector";

import { Style } from "../../style.js";

/**
 * @public
 */
export function hasTextDecoration(
  device: Device,
  context?: Context,
): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device, context);

    return (
      style.computed("text-decoration-color").none(Color.isTransparent) &&
      style
        .computed("text-decoration-line")
        .none((line) => line.type === "keyword")
    );
  };
}
