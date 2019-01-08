import { some } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { getTextAlternative } from "./get-text-alternative";

export function hasTextAlternative(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return some(
    getTextAlternative(element, context, device),
    textAlternative => textAlternative !== null && textAlternative.trim() !== ""
  );
}
