import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Context } from "@siteimprove/alfa-selector";
import { getBackground } from "../dom/get-colors";

const { isReplaced } = Element;

export function hasTransparentBackground(
  element: Element,
  device: Device,
  context: Context
): boolean {
  if (isReplaced || getBackground(element, device, context)) {
    return true;
  }
  const children = element.children;
}
