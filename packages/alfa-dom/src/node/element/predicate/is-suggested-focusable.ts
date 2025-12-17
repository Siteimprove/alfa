import { Element } from "../../element.js";

/**
 * {@link https://html.spec.whatwg.org/multipage/#tabindex-value}
 *
 * @remarks
 * Draggable elements for which the user agent supports drag operations without
 * a pointer device are also suggested focusable. However, we're not aware of
 * any such cases and therefore don't suggest making draggable elements
 * focusable.
 *
 * @public
 */
export function isSuggestedFocusable(element: Element): boolean {
  if (element.isInert()) {
    return false;
  }

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
      // The type is ensured by the switch on the name.
      return (element as Element<"summary">).isSummaryForItsParentDetails();
  }

  return (
    Element.isEditingHost(element) ||
    Element.isBrowsingContextContainer(element)
  );
}
