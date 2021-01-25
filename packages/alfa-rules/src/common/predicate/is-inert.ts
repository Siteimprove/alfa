import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

/**
 * @see https://html.spec.whatwg.org/#inert
 */
export function isInert(device: Device): Predicate<Element> {
  return (element) => {
    const visibility = Style.from(element, device).computed("visibility").value;

    switch (visibility.value) {
      case "hidden":
      case "collapse":
        return true;

      default:
        return false;
    }
  };
}
