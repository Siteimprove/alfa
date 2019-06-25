import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { isWhitespace } from "@siteimprove/alfa-unicode";
import { trim } from "@siteimprove/alfa-util";
import { getTextAlternative } from "./get-text-alternative";

const { map } = BrowserSpecific;

export function hasTextAlternative(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getTextAlternative(element, context, device), textAlternative => {
    return (
      textAlternative !== null && trim(textAlternative, isWhitespace) !== ""
    );
  });
}
