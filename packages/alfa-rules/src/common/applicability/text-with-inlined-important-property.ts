import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  Namespace,
  Node,
  Text,
} from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Property, Style } from "@siteimprove/alfa-style";

const { hasNamespace, isElement } = Element;
const { and } = Refinement;
const { hasSpecifiedStyle, isImportant, isVisible } = Style;
const { isText } = Text;

/**
 * @internal
 */
export function textWithInlinedImportantProperty(
  document: Document,
  device: Device,
  property: Property.Name
): Iterable<Element> {
  return (
    document
      .descendants(Node.fullTree)
      .filter(and(isElement, hasNamespace(Namespace.HTML)))
      // We assume !important properties in style attribute are less frequent
      // than visible text node children, and filter in that order.
      .filter(
        and(
          // The specified value is declared in a style attribute
          hasSpecifiedStyle(
            property,
            (_, source) =>
              // A property is declared in a style attribute if
              // its declaration has an owner element
              source.some((declaration) => declaration.owner.isSome()),
            device
          ),
          // The computed value is important (`!important`)
          isImportant(device, property),
          // The element has visible text node children
          (element) =>
            element.children(Node.fullTree).some(and(isText, isVisible(device)))
        )
      )
  );
}
