import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { getAttribute } from "./get-attribute";
import { getClosest } from "./get-closest";
import { getId } from "./get-id";
import { getRootNode } from "./get-root-node";
import { isElement } from "./guards";
import { isLabelable } from "./is-labelable";
import { querySelector } from "./query-selector";
import { Element, Node } from "./types";

/**
 * Given an element and a context, get the form label associated with the
 * element. If no form label is associated with the element within the context,
 * `null` is returned.
 *
 * @example
 * const input = <input type="text" id="foo" />;
 * const form = (
 *   <form>
 *     <label for="foo">Foo</label>
 *     {input}
 *   </form>
 * );
 * getLabel(input, form);
 * // => <label for="foo">...</label>
 *
 * @see https://html.spec.whatwg.org/#labeled-control
 */
export function getLabel(element: Element, context: Node): Option<Element> {
  if (!isLabelable(element, context)) {
    return None;
  }

  return getId(element, context)
    .andThen(id => {
      if (id !== "") {
        const rootNode = getRootNode(element, context);

        if (rootNode !== element) {
          const label = querySelector(
            rootNode,
            context,
            Predicate.and(
              isElement,
              element =>
                element.localName === "label" &&
                getAttribute(element, context, "for").includes(id)
            )
          );

          return label.filter(label => {
            const target = querySelector(
              rootNode,
              context,
              Predicate.and(isElement, element =>
                getId(element, context).includes(id)
              )
            );

            return target.includes(element);
          });
        }
      }

      return None;
    })
    .orElse(() => getClosest(element, context, "label"));
}
