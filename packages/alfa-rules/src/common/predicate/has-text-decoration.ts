import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

export function hasTextDecoration(
  device: Device,
  context?: Context
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
