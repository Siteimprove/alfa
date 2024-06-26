import type { Element } from "../../element.js";

/**
 * {@link https://html.spec.whatwg.org/#dom-draggable}
 *
 * @public
 */
export function isDraggable(element: Element): boolean {
  return element
    .attribute("draggable")
    .map((attribute) =>
      attribute.enumerate("true", "false", "auto").getOr("auto"),
    )
    .some((draggable) => {
      switch (draggable) {
        case "true":
          return true;

        case "false":
          return false;

        case "auto":
          switch (element.name) {
            case "img":
              return true;

            case "a":
              return element.attribute("href").isSome();

            default:
              return false;
          }
      }
    });
}
