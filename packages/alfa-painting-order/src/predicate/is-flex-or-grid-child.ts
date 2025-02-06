import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Style } from "@siteimprove/alfa-style";

const { isFlexContainer, isGridContainer } = Style;

export function isFlexOrGridChild(device: Device) {
  return (element: Element) =>
    element
      .parent(Node.fullTree)
      .filter(Element.isElement)
      .some((parent) => {
        const style = Style.from(parent, device);
        return isFlexContainer(style) || isGridContainer(style);
      });
}
