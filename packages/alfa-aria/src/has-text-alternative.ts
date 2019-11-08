import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { isWhitespace } from "@siteimprove/alfa-unicode";

import { getTextAlternative } from "./get-text-alternative";

export function hasTextAlternative(
  node: Element | Text,
  context: Node,
  device: Device
): Branched<boolean, Browser> {
  return getTextAlternative(node, context, device).map(textAlternative =>
    textAlternative
      .map(textAlternative =>
        Iterable.some(Iterable.from(textAlternative), char =>
          isWhitespace(char.charCodeAt(0))
        )
      )
      .getOr(false)
  );
}
