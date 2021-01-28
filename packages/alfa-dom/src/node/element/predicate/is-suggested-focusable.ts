import { Element } from "../../element";

/**
 * @see https://html.spec.whatwg.org/#tabindex-value
 *
 * @remarks
 * Draggable elements for which the user agent supports drag operations without
 * a pointer device are also suggested focusable. However, we're not aware of
 * any such cases and therefore don't suggest making draggable elements
 * focusable.
 */
export function isSuggestedFocusable(element: Element): boolean {
  switch (element.name) {
    case "a":
    case "link":
      return element.attribute("href").isSome();

    case "input":
      return element
        .attribute("type")
        .flatMap((attribute) => attribute.enumerate("hidden"))
        .isNone();

    case "audio":
    case "video":
      return element.attribute("controls").isSome();

    case "button":
    case "select":
    case "textarea":
      return true;

    case "summary":
      return element
        .parent()
        .filter(Element.isElement)
        .some(
          (parent) =>
            parent.name === "details" &&
            parent
              .children()
              .filter(Element.isElement)
              .find(Element.hasName("summary"))
              .includes(element)
        );
  }

  return (
    Element.isEditingHost(element) ||
    Element.isBrowsingContextContainer(element)
  );
}
