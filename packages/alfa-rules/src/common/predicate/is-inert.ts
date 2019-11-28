import { Style } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function isInert(device: Device): Predicate<Element> {
  return element => {
    const visibility = Style.from(element).computed("visibility");

    if (visibility.isSome()) {
      switch (visibility.get().value.value) {
        case "hidden":
        case "collapse":
          return true;
      }
    }

    return false;
  };
}
