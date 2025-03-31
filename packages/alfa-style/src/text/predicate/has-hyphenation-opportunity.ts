import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Context } from "@siteimprove/alfa-selector";
import { String } from "@siteimprove/alfa-string";

import { Style } from "../../style.js";

/**
 * Detect hyphenation opportunities in a Text node.
 *
 * @public
 */
export function hasHyphenationOpportunity(
  device: Device,
  context?: Context,
): Predicate<Text> {
  return (text) =>
    text
      .parent()
      .filter(Element.isElement)
      // If the parent is not an Element, we don't have an `hyphens` property and
      // act as if it was `auto`.
      .every((parent) => {
        switch (
          Style.from(parent, device, context).computed("hyphens").value.value
        ) {
          case "none":
            return false;
          case "manual":
            return String.hasHyphenationOpportunity(text.data);
          case "auto":
            // We assume that the UA will hyphenate the text if it can.
            // This is actually language dependant. Since our main use case is
            // Western languages written in Latin script, we can assume that
            // they will be hyphenated.
            // This is incorrect for several other languages, notably CJK and
            // East Asian languages; and for "weird" words in Latin script. For
            // example, "Supercalifragilisticexpialidocious" is not automatically
            // hyphenated in Chrome.
            return true;
        }
      });
}
