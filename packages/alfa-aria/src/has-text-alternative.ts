import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { isWhitespace } from "@siteimprove/alfa-unicode";
import { trim } from "@siteimprove/alfa-util";
import { getTextAlternative } from "./get-text-alternative";

export function hasTextAlternative(
  element: Element,
  context: Node,
  device: Device
): Branched<boolean, Browser> {
  return getTextAlternative(element, context, device).map(textAlternative =>
    textAlternative
      .map(textAlternative => trim(textAlternative, isWhitespace) !== "")
      .getOr(false)
  );
}
